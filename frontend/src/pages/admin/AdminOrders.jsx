import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { money, formatDate } from '../../utils/format.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (order, order_status) => {
    if (order_status === order.order_status) return;
    setUpdatingId(order.id);
    try {
      await api.patch(`/orders/${order.id}/status`, { order_status });
      toast(`${order.order_no} → ${order_status}`);
      await load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (error) {
    return (
      <main className="container page">
        <EmptyState icon="⚠️" title="Could not load orders">
          {error}
        </EmptyState>
      </main>
    );
  }

  if (!orders) return <Spinner />;

  return (
    <main className="container page">
      <div className="page-head">
        <div>
          <h1>Order management</h1>
          <p>Move orders through their fulfilment stages.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{order.order_no}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td>
                    {order.user?.name}
                    <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {order.user?.mobile}
                    </div>
                  </td>
                  <td>
                    {order.OrderHasItem?.map((item) => (
                      <div key={item.id} style={{ fontSize: '0.86rem' }}>
                        {item.quantity}× {item.product?.product_name}
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700 }}>{money(order.total_amount)}</td>
                  <td>
                    <StatusBadge status={order.payment_status} />
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      {order.payment_method || 'cod'}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={order.order_status} />
                  </td>
                  <td>
                    <select
                      className="input"
                      value={order.order_status}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateStatus(order, e.target.value)}
                      aria-label={`Status for ${order.order_no}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
