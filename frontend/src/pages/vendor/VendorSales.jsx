import { useEffect, useMemo, useState } from 'react';
import { api, errorMessage } from '../../api/client.js';
import { money, formatDate, PLACEHOLDER_IMG } from '../../utils/format.js';
import Spinner from '../../components/Spinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

export default function VendorSales() {
  // the API returns one row per sold line-item, not per order
  const [sales, setSales] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/orders/my-sales')
      .then(({ data }) => !cancelled && setSales(data))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!sales) return null;
    const revenue = sales.reduce((sum, s) => sum + Number(s.total_price), 0);
    const units = sales.reduce((sum, s) => sum + s.quantity, 0);
    return { revenue, units, lines: sales.length };
  }, [sales]);

  if (error) {
    return (
      <main className="container page">
        <EmptyState icon="⚠️" title="Could not load sales">
          {error}
        </EmptyState>
      </main>
    );
  }

  if (!sales) return <Spinner />;

  return (
    <main className="container page">
      <div className="page-head">
        <div>
          <h1>Sales</h1>
          <p>Every item customers have bought from your store.</p>
        </div>
      </div>

      <div className="stat-row">
        <div className="card stat">
          <div className="stat__label">Revenue</div>
          <div className="stat__value">{money(stats.revenue)}</div>
        </div>
        <div className="card stat">
          <div className="stat__label">Units sold</div>
          <div className="stat__value">{stats.units}</div>
        </div>
        <div className="card stat">
          <div className="stat__label">Sale entries</div>
          <div className="stat__value">{stats.lines}</div>
        </div>
      </div>

      {sales.length === 0 ? (
        <EmptyState icon="💰" title="No sales yet">
          Once customers buy or win your items, they'll appear here.
        </EmptyState>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Buyer</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Order status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontWeight: 600 }}>
                      <img
                        className="thumb"
                        src={
                          sale.product?.ProductImage?.[0]?.product_img ||
                          PLACEHOLDER_IMG
                        }
                        alt=""
                      />
                      {sale.product?.product_name}
                      {sale.order?.bid_id && (
                        <span className="badge badge--won">Auction</span>
                      )}
                    </span>
                  </td>
                  <td>
                    {sale.order?.user?.name}
                    <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {sale.order?.user?.mobile}
                    </div>
                  </td>
                  <td>{sale.quantity}</td>
                  <td style={{ fontWeight: 700 }}>{money(sale.total_price)}</td>
                  <td>
                    <StatusBadge status={sale.order?.order_status} />
                  </td>
                  <td>{formatDate(sale.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
