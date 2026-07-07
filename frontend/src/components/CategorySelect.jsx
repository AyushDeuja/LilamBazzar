import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

const ADD_NEW = '__add_new__';

/**
 * Category picker with inline creation: shows the existing categories in a
 * select, plus an "Add new category…" option that reveals a text input and
 * creates the category on the spot (any authenticated user may create one).
 *
 * Props:
 *  - value: current category id ('' when none)
 *  - onChange: (id: string) => void
 */
export default function CategorySelect({ value, onChange }) {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSelect = (event) => {
    if (event.target.value === ADD_NEW) {
      setAdding(true);
    } else {
      setAdding(false);
      onChange(event.target.value);
    }
  };

  const createCategory = async () => {
    const name = newName.trim();
    if (!name) return;

    // reuse an existing category instead of creating a duplicate
    const existing = categories.find(
      (c) => c.category_name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      onChange(String(existing.id));
      setAdding(false);
      setNewName('');
      toast(`Using existing category "${existing.category_name}"`);
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post('/categories', { category_name: name });
      setCategories((prev) => [...prev, data]);
      onChange(String(data.id));
      setAdding(false);
      setNewName('');
      toast(`Category "${data.category_name}" added`);
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <select
        className="input"
        value={adding ? ADD_NEW : value}
        onChange={handleSelect}
        aria-label="Category"
      >
        <option value="">Select a category…</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.category_name}
          </option>
        ))}
        <option value={ADD_NEW}>➕ Add new category…</option>
      </select>

      {adding && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="input"
            placeholder="New category name"
            value={newName}
            autoFocus
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              // create on Enter without submitting the surrounding form
              if (e.key === 'Enter') {
                e.preventDefault();
                createCategory();
              }
            }}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={createCategory}
            disabled={saving || !newName.trim()}
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setAdding(false);
              setNewName('');
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
