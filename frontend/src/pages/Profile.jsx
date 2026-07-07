import { useEffect, useState } from 'react';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/auth/profile')
      .then(({ data }) => {
        if (cancelled) return;
        setForm({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          organization_name: data.organization_name || '',
          pan_no: data.pan_no || '',
        });
      })
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!form && !error) return <Spinner />;

  const isVendor = user?.user_role === 'vendor';
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      // vendor-only fields are rejected for other roles
      ...(isVendor && {
        organization_name: form.organization_name.trim(),
        pan_no: form.pan_no.trim(),
      }),
    };

    try {
      await api.patch('/auth/profile', payload);
      await refreshProfile();
      toast('Profile updated');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container page" style={{ maxWidth: 560 }}>
      <div className="page-head">
        <div>
          <h1>My profile</h1>
          <p>
            Signed in as <strong>{user?.user_role}</strong>.
          </p>
        </div>
      </div>

      <form className="card card__body" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        {form && (
          <>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" className="input" required value={form.name} onChange={set('name')} />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                />
              </div>
              <div className="field">
                <label htmlFor="mobile">Mobile</label>
                <input
                  id="mobile"
                  className="input"
                  required
                  minLength={5}
                  maxLength={15}
                  value={form.mobile}
                  onChange={set('mobile')}
                />
              </div>
            </div>
            {isVendor && (
              <div className="form-row">
                <div className="field">
                  <label htmlFor="organization_name">Organization</label>
                  <input
                    id="organization_name"
                    className="input"
                    required
                    value={form.organization_name}
                    onChange={set('organization_name')}
                  />
                </div>
                <div className="field">
                  <label htmlFor="pan_no">PAN number</label>
                  <input
                    id="pan_no"
                    className="input"
                    required
                    value={form.pan_no}
                    onChange={set('pan_no')}
                  />
                </div>
              </div>
            )}
            <button className="btn btn--accent" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
