import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errorMessage } from '../api/client.js';
import { roleHome } from '../utils/roles.js';

const EMPTY = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  organization_name: '',
  pan_no: '',
};

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    // vendor-only fields must be omitted entirely for customers —
    // the API rejects them for non-vendor roles
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      password: form.password,
      user_role: role,
      ...(role === 'vendor' && {
        organization_name: form.organization_name.trim(),
        pan_no: form.pan_no.trim(),
      }),
    };

    try {
      await register(payload);
      toast(
        role === 'vendor'
          ? 'Store created — add your first listing!'
          : 'Account created — happy bidding!',
      );
      // vendors land on their (empty) listings page to start selling
      navigate(roleHome(role), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-wrap">
      <div className="card auth-card">
        <h1>Create your account</h1>
        <p className="sub">Join as a shopper or open a vendor storefront.</p>

        <div className="field">
          <label>I want to</label>
          <div className="segmented" role="tablist" aria-label="Account type">
            <button
              type="button"
              className={role === 'customer' ? 'active' : ''}
              onClick={() => setRole('customer')}
            >
              🛍️ Shop &amp; bid
            </button>
            <button
              type="button"
              className={role === 'vendor' ? 'active' : ''}
              onClick={() => setRole('vendor')}
            >
              🏪 Sell products
            </button>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              required
              value={form.name}
              onChange={set('name')}
            />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
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
                type="tel"
                autoComplete="tel"
                required
                minLength={5}
                maxLength={15}
                value={form.mobile}
                onChange={set('mobile')}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={form.password}
              onChange={set('password')}
            />
          </div>

          {role === 'vendor' && (
            <div className="form-row">
              <div className="field">
                <label htmlFor="organization_name">Organization name</label>
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
                <span className="hint">Used to verify your business.</span>
              </div>
            </div>
          )}

          <button className="btn btn--accent btn--block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
