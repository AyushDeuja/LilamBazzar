import { Link } from 'react-router-dom';
import { money, productImage, auctionPhase } from '../utils/format.js';

const PHASE_BADGE = {
  live: { className: 'badge badge--live', label: 'Live auction' },
  upcoming: { className: 'badge badge--upcoming', label: 'Starts soon' },
  ended: { className: 'badge badge--ended', label: 'Auction ended' },
};

export default function ProductCard({ product }) {
  const phase = product.is_auction ? auctionPhase(product.auction) : null;
  const badge = phase
    ? PHASE_BADGE[phase]
    : { className: 'badge badge--buy', label: 'Buy now' };

  const price = product.is_auction
    ? Number(product.auction?.current_price ?? product.base_price)
    : Number(product.fixed_price);

  const priceLabel = product.is_auction
    ? phase === 'ended'
      ? 'Final bid'
      : 'Current bid'
    : 'Price';

  return (
    <Link to={`/products/${product.id}`} className="card product-card">
      <div className="product-card__media">
        <img src={productImage(product)} alt={product.product_name} loading="lazy" />
        <span className={`product-card__flag ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <div className="product-card__body">
        <span className="product-card__category">
          {product.category?.category_name || 'Uncategorized'}
        </span>
        <span className="product-card__name">{product.product_name}</span>
        <div className="product-card__price">
          <span className="product-card__amount">{money(price)}</span>
          <span className="product-card__label">{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
}
