import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import ImageUploader from '../../components/ImageUploader.jsx';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const EMPTY = { category_name: '', description: '' };

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [image, setImage] = useState([]); // single image kept as array for the uploader
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({
      category_name: category.category_name,
      description: category.description || '',
    });
    setImage(category.category_img ? [category.category_img] : []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setEditingId(null);
    setForm(EMPTY);
    setImage([]);
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);

    const payload = {
      category_name: form.category_name.trim(),
      description: form.description.trim() || undefined,
      // only send a NEW image (base64) — re-sending the stored URL would
      // needlessly re-upload it
      ...(image[0]?.startsWith('data:') && { category_img: image[0] }),
    };

    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, payload);
        toast('Category updated');
      } else {
        await api.post('/categories', payload);
        toast('Category created');
      }
      reset();
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category) => {
    if (
      !window.confirm(
        `Delete "${category.category_name}"? Products in it keep working but lose the category.`,
      )
    )
      return;
    try {
      await api.delete(`/categories/${category.id}`);
      toast('Category deleted');
      if (editingId === category.id) reset();
      await load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (error) {
    return (
      <main className="container page">
        <EmptyState icon="⚠️" title="Could not load categories">
          {error}
        </EmptyState>
      </main>
    );
  }

  if (!categories) return <Spinner />;

  return (
    <main className="container page" style={{ maxWidth: 860 }}>
      <div className="page-head">
        <div>
          <h1>Categories</h1>
          <p>Organize the marketplace catalog.</p>
        </div>
      </div>

      <form className="card card__body" onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem' }}>
          {editingId ? 'Edit category' : 'Add a category'}
        </h3>
        {formError && <div className="form-error">{formError}</div>}
        <div className="form-row">
          <div className="field">
            <label htmlFor="category_name">Name</label>
            <input
              id="category_name"
              className="input"
              required
              value={form.category_name}
              onChange={(e) => setForm({ ...form, category_name: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              className="input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label>Image</label>
          <ImageUploader images={image} onChange={setImage} />
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn--accent" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}
          </button>
          {editingId && (
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <EmptyState icon="🗂️" title="No categories yet" />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontWeight: 600 }}>
                      {category.category_img && (
                        <img className="thumb" src={category.category_img} alt="" />
                      )}
                      {category.category_name}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>
                    {category.description || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => startEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => remove(category)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
