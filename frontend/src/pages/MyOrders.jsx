import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { money, formatDate, PLACEHOLDER_IMG } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const CANCELLABLE = new Set(['pending', 'confirmed']);

export default function MyOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancellingId(id);
    try {
      await api.patch(`/orders/${id}/cancel`);
      toast('Order cancelled');
      await load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (error) {
    return (
      <main className="container page">
        <EmptyState icon="⚠️" title="Could not load your orders">
          {error}
        </EmptyState>
      </main>
    );
  }

  if (!orders) return <Spinner />;

  return (
    <main className="container page" style={{ maxWidth: 860 }}>
      <div className="page-head">
        <div>
          <h1>My orders</h1>
          <p>Purchases and claimed auction wins.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet">
          Your purchases will show up here.{' '}
          <Link to="/" style={{ fontWeight: 700 }}>
            Start shopping
          </Link>
          .
        </EmptyState>
      ) : (
        orders.map((order) => (
          <div className="card order-card" key={order.id}>
            <div className="order-card__head">
              <span className="order-card__no">{order.order_no}</span>
              <span className="order-card__date">{formatDate(order.createdAt)}</span>
              {order.bid_id && <span className="badge badge--won">Auction win</span>}
              <span className="order-card__spacer" />
              <StatusBadge status={order.order_status} />
              <StatusBadge status={order.payment_status} />
            </div>

            {order.OrderHasItem?.map((item) => (
              <div className="order-item" key={item.id}>
                <img
                  src={item.product?.ProductImage?.[0]?.product_img || PLACEHOLDER_IMG}
                  alt=""
                />
                <div>
                  <Link
                    to={`/products/${item.product_id}`}
                    className="order-item__name"
                  >
                    {item.product?.product_name}
                  </Link>
                  <div className="order-item__qty">
                    {money(item.unit_price)} × {item.quantity}
                  </div>
                </div>
                <div className="order-item__price">{money(item.total_price)}</div>
              </div>
            ))}

            <div className="order-card__foot">
              <span style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                Paid via {order.payment_method || 'cod'}
              </span>
              <span className="order-card__spacer" />
              <span className="order-card__total">{money(order.total_amount)}</span>
              {CANCELLABLE.has(order.order_status) && (
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => cancelOrder(order.id)}
                  disabled={cancellingId === order.id}
                >
                  {cancellingId === order.id ? 'Cancelling…' : 'Cancel order'}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
