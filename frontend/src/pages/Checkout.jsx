import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { money, productImage } from '../utils/format.js';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on delivery', note: 'Pay when it arrives' },
  { value: 'khalti', label: 'Khalti', note: 'Marked pending — gateway coming soon' },
  { value: 'esewa', label: 'eSewa', note: 'Marked pending — gateway coming soon' },
];

/**
 * Two checkout modes:
 *  - cart mode (default): buys the fixed-price items in the cart
 *  - auction mode (?bid_id=&product_id=): claims a won auction at the
 *    winning bid price
 */
export default function Checkout() {
  const [params] = useSearchParams();
  const bidId = params.get('bid_id');
  const productId = params.get('product_id');
  const auctionMode = Boolean(bidId && productId);

  const cart = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [wonProduct, setWonProduct] = useState(null);
  const [loadingWon, setLoadingWon] = useState(auctionMode);
  const [payment, setPayment] = useState('cod');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!auctionMode) return;
    let cancelled = false;
    api
      .get(`/products/browse/${productId}`)
      .then(({ data }) => !cancelled && setWonProduct(data))
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoadingWon(false));
    return () => {
      cancelled = true;
    };
  }, [auctionMode, productId]);

  const lines = auctionMode
    ? wonProduct
      ? [
          {
            product_id: wonProduct.id,
            name: wonProduct.product_name,
            image: productImage(wonProduct),
            quantity: 1,
            // the winning bid == the auction's final current_price
            price: Number(
              wonProduct.auction?.current_price ??
                wonProduct.auction?.starting_price ??
                0,
            ),
          },
        ]
      : []
    : cart.items.map((i) => ({ ...i, image: i.image }));

  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const placeOrder = async () => {
    setError('');
    setPlacing(true);
    try {
      const payload = {
        items: lines.map((l) => ({
          product_id: l.product_id,
          quantity: l.quantity,
        })),
        payment_method: payment,
        ...(auctionMode && { bid_id: Number(bidId) }),
      };
      const { data } = await api.post('/orders', payload);
      if (!auctionMode) cart.clearCart();
      toast(data.message || 'Order placed!');
      navigate('/my-orders');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  if (loadingWon) return <Spinner />;

  if (lines.length === 0) {
    return (
      <main className="container page">
        <EmptyState icon="🛒" title="Your cart is empty">
          <Link to="/" style={{ fontWeight: 700, color: 'var(--amber-deep)' }}>
            Browse the marketplace
          </Link>{' '}
          to find something you love.
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="container page" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <div>
          <h1>{auctionMode ? 'Claim your auction win 🎉' : 'Checkout'}</h1>
          <p>
            {auctionMode
              ? 'Confirm your order at your winning bid price.'
              : 'Review your cart and choose how to pay.'}
          </p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card order-card">
        {lines.map((line) => (
          <div className="order-item" key={line.product_id}>
            <img src={line.image} alt="" />
            <div>
              <div className="order-item__name">{line.name}</div>
              <div className="order-item__qty">
                {money(line.price)} ×{' '}
                {auctionMode ? (
                  1
                ) : (
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={line.stock}
                    value={line.quantity}
                    onChange={(e) =>
                      cart.updateQuantity(
                        line.product_id,
                        Number(e.target.value) || 1,
                      )
                    }
                    style={{ width: 74, padding: '0.25rem 0.5rem', display: 'inline-block' }}
                    aria-label={`Quantity for ${line.name}`}
                  />
                )}
              </div>
            </div>
            <div className="order-item__price">
              {money(line.price * line.quantity)}
              {!auctionMode && (
                <button
                  className="btn btn--danger btn--sm"
                  style={{ marginLeft: '0.75rem' }}
                  onClick={() => cart.removeItem(line.product_id)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="order-card__foot">
          <span>Total</span>
          <span className="order-card__spacer" />
          <span className="order-card__total">{money(total)}</span>
        </div>
      </div>

      <h2 className="section-title">Payment method</h2>
      <div className="card card__body" style={{ display: 'grid', gap: '0.6rem' }}>
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.value}
            style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', cursor: 'pointer' }}
          >
            <input
              type="radio"
              name="payment"
              value={method.value}
              checked={payment === method.value}
              onChange={() => setPayment(method.value)}
            />
            <span style={{ fontWeight: 600 }}>{method.label}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>
              {method.note}
            </span>
          </label>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn--accent" onClick={placeOrder} disabled={placing}>
          {placing ? 'Placing order…' : `Place order · ${money(total)}`}
        </button>
        <Link to="/" className="btn btn--ghost">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
