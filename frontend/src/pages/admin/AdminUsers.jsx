import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/format.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const ROLE_BADGE = {
  admin: 'badge badge--outbid',
  vendor: 'badge badge--pending',
  customer: 'badge badge--confirmed',
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      // the API 400s when the table is empty — treat that as an empty list
      if (err?.response?.status === 400) setUsers([]);
      else setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (user) => {
    if (!window.confirm(`Delete account "${user.name}" (${user.email})?`)) return;
    setDeletingId(user.id);
    try {
      await api.delete(`/users/${user.id}`);
      toast('User deleted');
      await load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <main className="container page">
        <EmptyState icon="⚠️" title="Could not load users">
          {error}
        </EmptyState>
      </main>
    );
  }

  if (!users) return <Spinner />;

  return (
    <main className="container page">
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>Everyone registered on the platform.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>
                    {user.name}
                    {me?.id === user.id && (
                      <span style={{ color: 'var(--muted)' }}> (you)</span>
                    )}
                  </td>
                  <td>
                    {user.email}
                    <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {user.mobile}
                    </div>
                  </td>
                  <td>
                    <span className={ROLE_BADGE[user.user_role] || 'badge badge--neutral'}>
                      {user.user_role}
                    </span>
                  </td>
                  <td>{user.organization_name || '—'}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => remove(user)}
                      disabled={me?.id === user.id || deletingId === user.id}
                      title={me?.id === user.id ? "You can't delete yourself" : undefined}
                    >
                      {deletingId === user.id ? 'Deleting…' : 'Delete'}
                    </button>
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
