import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  money,
  formatDate,
  productImage,
  auctionPhase,
  minNextBid,
  PLACEHOLDER_IMG,
} from '../utils/format.js';
import Countdown from '../components/Countdown.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

// the winner is picked by a backend cron that runs every minute,
// so poll while the auction is live or freshly ended
const POLL_MS = 15000;

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [history, setHistory] = useState(null);

  const auction = product?.auction;
  const phase = auctionPhase(auction);
  const isOwner = user && product && product.organization_id === user.id;

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/products/browse/${id}`);
      setProduct(data);
      setLoadError('');
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  }, [id]);

  const loadHistory = useCallback(async () => {
    if (!user || !product?.auction) return;
    try {
      const { data } = await api.get(
        `/bids/auction/${product.auction.id}/history`,
      );
      setHistory(data);
    } catch {
      setHistory(null); // fall back to the top-5 embedded in the product
    }
  }, [user, product?.auction]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // keep price/winner fresh while the auction is live (or waiting on the cron)
  useEffect(() => {
    if (!auction || phase === 'upcoming') return;
    if (phase === 'ended' && auction.winner_id != null) return;
    if (phase === 'ended' && !auction.is_active) return;
    const timer = setInterval(() => {
      load();
      loadHistory();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [auction, phase, load, loadHistory]);

  const bids = useMemo(
    () => history ?? auction?.bids ?? [],
    [history, auction],
  );
  const nextBid = auction ? minNextBid(auction) : 0;

  const myWinningBid = useMemo(() => {
    if (!user || !auction || auction.winner_id !== user.id) return null;
    return bids
      .filter((b) => b.bidder_id === user.id)
      .sort((a, b) => Number(b.bid_amount) - Number(a.bid_amount))[0];
  }, [user, auction, bids]);

  if (loadError) {
    return (
      <main className="container page">
        <EmptyState icon="⚠️" title="Product not found">
          {loadError} — <Link to="/">back to the marketplace</Link>
        </EmptyState>
      </main>
    );
  }

  if (!product) return <Spinner />;

  const images =
    product.ProductImage?.length > 0
      ? product.ProductImage.map((i) => i.product_img)
      : [PLACEHOLDER_IMG];

  const placeBid = async (event) => {
    event.preventDefault();
    setBidError('');
    setPlacingBid(true);
    try {
      const { data } = await api.post(`/bids/auction/${auction.id}`, {
        bid_amount: Number(bidAmount),
      });
      toast(data.message || 'Bid placed!');
      setBidAmount('');
      await load();
      await loadHistory();
    } catch (err) {
      setBidError(errorMessage(err));
    } finally {
      setPlacingBid(false);
    }
  };

  const addToCart = () => {
    addItem(
      {
        product_id: product.id,
        name: product.product_name,
        price: Number(product.fixed_price),
        image: productImage(product),
        stock: product.stock,
      },
      quantity,
    );
    toast(`${product.product_name} added to cart`);
  };

  const buyNow = () => {
    addToCart();
    navigate('/checkout');
  };

  return (
    <main className="container page">
      <div className="detail-grid">
        {/* gallery */}
        <section>
          <div className="gallery__main">
            <img src={images[activeImage] ?? images[0]} alt={product.product_name} />
          </div>
          {images.length > 1 && (
            <div className="gallery__thumbs">
              {images.map((src, i) => (
                <button
                  key={i}
                  className={i === activeImage ? 'active' : ''}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          <h2 className="section-title">About this item</h2>
          <div className="card card__body">
            <p style={{ margin: 0 }}>
              {product.description || 'No description provided.'}
            </p>
            <ul className="meta-list">
              <li>
                Category:{' '}
                <strong>{product.category?.category_name || 'Uncategorized'}</strong>
              </li>
              <li>
                Sold by:{' '}
                <strong>
                  {product.user?.organization_name || product.user?.name}
                </strong>
              </li>
              <li>
                In stock: <strong>{product.stock}</strong>
              </li>
              <li>
                Listed: <strong>{formatDate(product.createdAt)}</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* purchase / bid panel */}
        <section className="bid-panel">
          <div className="card card__body">
            <h1 style={{ fontSize: '1.4rem' }}>{product.product_name}</h1>

            {product.is_auction && auction ? (
              <>
                {phase === 'live' && <span className="badge badge--live">Live auction</span>}
                {phase === 'upcoming' && (
                  <span className="badge badge--upcoming">Starts {formatDate(auction.start_time)}</span>
                )}
                {phase === 'ended' && <span className="badge badge--ended">Auction ended</span>}

                <div style={{ marginTop: '0.9rem' }}>
                  <span className="product-card__label">
                    {phase === 'ended' ? 'Final bid' : 'Current bid'}
                  </span>
                  <div className="price-big">
                    {money(auction.current_price ?? auction.starting_price)}
                  </div>
                  <span className="hint" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    Started at {money(auction.starting_price)} · min increment{' '}
                    {money(auction.min_increment)}
                  </span>
                </div>

                {phase === 'live' && (
                  <Countdown target={auction.end_time} onEnd={load} />
                )}
                {phase === 'upcoming' && (
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                    Bidding opens {formatDate(auction.start_time)}.
                  </p>
                )}

                {/* bid form */}
                {phase === 'live' &&
                  (isOwner ? (
                    <div className="form-note">This is your own listing.</div>
                  ) : user ? (
                    <form onSubmit={placeBid}>
                      {bidError && <div className="form-error">{bidError}</div>}
                      <div className="field">
                        <label htmlFor="bid_amount">
                          Your bid (min {money(nextBid)})
                        </label>
                        <input
                          id="bid_amount"
                          className="input"
                          type="number"
                          min={nextBid}
                          step="0.01"
                          required
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={String(nextBid)}
                        />
                      </div>
                      <button
                        className="btn btn--accent btn--block"
                        disabled={placingBid}
                      >
                        {placingBid ? 'Placing bid…' : '🔨 Place bid'}
                      </button>
                    </form>
                  ) : (
                    <Link to="/login" className="btn btn--accent btn--block">
                      Log in to bid
                    </Link>
                  ))}

                {/* ended states */}
                {phase === 'ended' &&
                  (auction.is_active ? (
                    <div className="form-note">
                      Bidding closed — the winner is being finalized (checks run
                      every minute).
                    </div>
                  ) : myWinningBid ? (
                    <>
                      <div className="form-note">
                        🎉 You won this auction! Complete your order to claim it.
                      </div>
                      <button
                        className="btn btn--accent btn--block"
                        onClick={() =>
                          navigate(
                            `/checkout?bid_id=${myWinningBid.id}&product_id=${product.id}`,
                          )
                        }
                      >
                        Checkout your win
                      </button>
                    </>
                  ) : auction.winner_id ? (
                    <div className="form-note">
                      This auction has ended and a winner was selected.
                    </div>
                  ) : (
                    <div className="form-note">
                      This auction ended without any bids.
                    </div>
                  ))}

                {/* bid history */}
                <div className="bid-history">
                  <h3 style={{ fontSize: '1rem' }}>
                    Bid history {history ? `(${history.length})` : '(top 5)'}
                  </h3>
                  {bids.length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                      No bids yet — be the first!
                    </p>
                  ) : (
                    <ul>
                      {bids.map((b) => (
                        <li key={b.id}>
                          <span>
                            {b.bidder?.name || 'Bidder'}
                            {user && b.bidder_id === user.id && ' (you)'}
                          </span>
                          <strong>{money(b.bid_amount)}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!user && (
                    <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      <Link to="/login" style={{ fontWeight: 700 }}>
                        Log in
                      </Link>{' '}
                      to see the full history.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className="badge badge--buy">Buy now</span>
                <div style={{ marginTop: '0.9rem' }}>
                  <span className="product-card__label">Price</span>
                  <div className="price-big">{money(product.fixed_price)}</div>
                </div>

                {product.stock === 0 ? (
                  <div className="form-error" style={{ marginTop: '1rem' }}>
                    Out of stock.
                  </div>
                ) : isOwner ? (
                  <div className="form-note" style={{ marginTop: '1rem' }}>
                    This is your own listing.
                  </div>
                ) : (
                  <>
                    <div className="field" style={{ marginTop: '1rem' }}>
                      <label htmlFor="quantity">Quantity</label>
                      <input
                        id="quantity"
                        className="input"
                        type="number"
                        min={1}
                        max={product.stock}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(product.stock, Number(e.target.value) || 1),
                            ),
                          )
                        }
                      />
                      <span className="hint">{product.stock} available</span>
                    </div>
                    <div style={{ display: 'grid', gap: '0.6rem' }}>
                      <button className="btn btn--accent btn--block" onClick={buyNow}>
                        Buy now
                      </button>
                      <button className="btn btn--ghost btn--block" onClick={addToCart}>
                        🛒 Add to cart
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
