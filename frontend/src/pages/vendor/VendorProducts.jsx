import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  money,
  productImage,
  auctionPhase,
  formatDate,
} from '../../utils/format.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function VendorProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.product_name}"? This cannot be undone.`))
      return;
    setDeletingId(product.id);
    try {
      await api.delete(`/products/${product.id}`);
      toast('Listing deleted');
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
        <EmptyState icon="⚠️" title="Could not load your listings">
          {error}
        </EmptyState>
      </main>
    );
  }

  if (!products) return <Spinner />;

  return (
    <main className="container page">
      <div className="page-head">
        <div>
          <h1>My listings</h1>
          <p>Everything your store has put up for sale or auction.</p>
        </div>
        <Link to="/vendor/products/new" className="btn btn--accent">
          + New listing
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="🏪" title="No listings yet">
          Create your first product — fixed price or live auction.
        </EmptyState>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Auction status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const phase = p.is_auction ? auctionPhase(p.auction) : null;
                return (
                  <tr key={p.id}>
                    <td>
                      <Link
                        to={`/products/${p.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontWeight: 600 }}
                      >
                        <img className="thumb" src={productImage(p)} alt="" />
                        {p.product_name}
                      </Link>
                    </td>
                    <td>
                      {p.is_auction ? (
                        <span className="badge badge--pending">Auction</span>
                      ) : (
                        <span className="badge badge--buy">Fixed price</span>
                      )}
                    </td>
                    <td>
                      {p.is_auction
                        ? money(p.auction?.current_price ?? p.base_price)
                        : money(p.fixed_price)}
                    </td>
                    <td>{p.stock}</td>
                    <td>
                      {!p.is_auction ? (
                        '—'
                      ) : phase === 'live' ? (
                        <span className="badge badge--live">Live</span>
                      ) : phase === 'upcoming' ? (
                        <span className="badge badge--upcoming">
                          Starts {formatDate(p.auction?.start_time)}
                        </span>
                      ) : (
                        <span className="badge badge--ended">Ended</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link
                          to={`/vendor/products/${p.id}/edit`}
                          className="btn btn--ghost btn--sm"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => remove(p)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
