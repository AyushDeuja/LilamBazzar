import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const linkClass = ({ isActive }) =>
  isActive ? 'navbar__link active' : 'navbar__link';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="gavel" aria-hidden="true">
            🔨
          </span>
          Lilam<em>Bazzar</em>
        </Link>

        <nav className="navbar__links" aria-label="Main">
          <NavLink to="/" className={linkClass} end>
            Browse
          </NavLink>
          {user && user.user_role !== 'admin' && (
            <>
              <NavLink to="/my-bids" className={linkClass}>
                My Bids
              </NavLink>
              <NavLink to="/my-orders" className={linkClass}>
                My Orders
              </NavLink>
            </>
          )}
          {user?.user_role === 'vendor' && (
            <>
              <NavLink to="/vendor/products" className={linkClass}>
                My Listings
              </NavLink>
              <NavLink to="/vendor/sales" className={linkClass}>
                Sales
              </NavLink>
            </>
          )}
          {user?.user_role === 'admin' && (
            <>
              <NavLink to="/admin/orders" className={linkClass}>
                Orders
              </NavLink>
              <NavLink to="/admin/categories" className={linkClass}>
                Categories
              </NavLink>
              <NavLink to="/admin/users" className={linkClass}>
                Users
              </NavLink>
            </>
          )}
        </nav>

        <div className="navbar__spacer" />

        <div className="navbar__user">
          {user?.user_role !== 'admin' && (
            <button
              className="cart-button"
              onClick={() => navigate('/checkout')}
              aria-label={`Cart with ${count} items`}
              title="Cart / Checkout"
            >
              🛒
              {count > 0 && <span className="cart-button__badge">{count}</span>}
            </button>
          )}

          {user ? (
            <>
              <Link to="/profile" className="navbar__hello">
                Hi, <strong>{user.name?.split(' ')[0]}</strong>
              </Link>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn--accent btn--sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
