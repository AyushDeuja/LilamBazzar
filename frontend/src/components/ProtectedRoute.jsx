import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { roleHome } from '../utils/roles.js';
import Spinner from './Spinner.jsx';

/**
 * Guards nested routes. Optionally restrict to specific roles,
 * e.g. <ProtectedRoute roles={['vendor']} />.
 */
export default function ProtectedRoute({ roles }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // wrong role for this area — send them to their own home instead
  if (roles && !roles.includes(user.user_role)) {
    return <Navigate to={roleHome(user.user_role)} replace />;
  }

  return <Outlet />;
}
