import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { money, formatDate, PLACEHOLDER_IMG } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Reduces the raw bid list to one row per auction (the user's best bid),
 * annotated with the outcome so far.
 */
function summarize(bids, userId) {
  const byAuction = new Map();
  for (const bid of bids) {
    const existing = byAuction.get(bid.auction_id);
    if (!existing || Number(bid.bid_amount) > Number(existing.bid_amount)) {
      byAuction.set(bid.auction_id, bid);
    }
  }

  return [...byAuction.values()].map((bid) => {
    const auction = bid.auction;
    const ended =
      !auction.is_active || new Date(auction.end_time).getTime() <= Date.now();

    let status;
    if (!ended) {
      status =
        Number(bid.bid_amount) >= Number(auction.current_price)
          ? 'leading'
          : 'outbid';
    } else if (auction.is_active) {
      status = 'finalizing'; // ended but the winner cron hasn't run yet
    } else if (auction.winner_id === userId) {
      status = 'won';
    } else {
      status = 'lost';
    }
    return { bid, auction, status };
  });
}

const STATUS_BADGE = {
  leading: ['badge badge--won', 'Leading 🥇'],
  outbid: ['badge badge--outbid', 'Outbid'],
  finalizing: ['badge badge--pending', 'Finalizing…'],
  won: ['badge badge--won', 'Won 🎉'],
  lost: ['badge badge--neutral', 'Lost'],
};

export default function MyBids() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/bids/my-bids')
      .then(({ data }) => !cancelled && setBids(data))
      .catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(
    () => (bids && user ? summarize(bids, user.id) : []),
    [bids, user],
  );

  if (error) {
    return (
      <main className="container page">
        <EmptyState icon="⚠️" title="Could not load your bids">
          {error}
        </EmptyState>
      </main>
    );
  }

  if (!bids) return <Spinner />;

  return (
    <main className="container page">
      <div className="page-head">
        <div>
          <h1>My bids</h1>
          <p>Every auction you've taken part in, and how it's going.</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🔨" title="No bids yet">
          Find a <Link to="/" style={{ fontWeight: 700 }}>live auction</Link> and
          place your first bid!
        </EmptyState>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Your best bid</th>
                <th>Current / final price</th>
                <th>Ends</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ bid, auction, status }) => {
                const [badgeClass, badgeLabel] = STATUS_BADGE[status];
                return (
                  <tr key={auction.id}>
                    <td>
                      <Link
                        to={`/products/${auction.product_id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontWeight: 600 }}
                      >
                        <img
                          className="thumb"
                          src={
                            auction.product?.ProductImage?.[0]?.product_img ||
                            PLACEHOLDER_IMG
                          }
                          alt=""
                        />
                        {auction.product?.product_name}
                      </Link>
                    </td>
                    <td>{money(bid.bid_amount)}</td>
                    <td>{money(auction.current_price ?? auction.starting_price)}</td>
                    <td>{formatDate(auction.end_time)}</td>
                    <td>
                      <span className={badgeClass}>{badgeLabel}</span>
                    </td>
                    <td>
                      {status === 'won' ? (
                        <button
                          className="btn btn--accent btn--sm"
                          onClick={() =>
                            navigate(
                              `/checkout?bid_id=${bid.id}&product_id=${auction.product_id}`,
                            )
                          }
                        >
                          Checkout
                        </button>
                      ) : status === 'leading' || status === 'outbid' ? (
                        <Link
                          to={`/products/${auction.product_id}`}
                          className="btn btn--ghost btn--sm"
                        >
                          View auction
                        </Link>
                      ) : null}
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
