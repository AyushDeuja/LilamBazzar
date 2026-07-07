import { useEffect, useMemo, useState } from 'react';
import { api, errorMessage } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyState from '../components/EmptyState.jsx';

const TYPE_FILTERS = [
  { value: 'all', label: 'Everything' },
  { value: 'auction', label: '🔨 Live auctions' },
  { value: 'fixed', label: '🛍️ Buy now' },
];

export default function Browse() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [type, setType] = useState('all');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get('/products/browse'), api.get('/categories')])
      .then(([productsRes, categoriesRes]) => {
        if (cancelled) return;
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (type === 'auction' && !p.is_auction) return false;
      if (type === 'fixed' && p.is_auction) return false;
      if (categoryId && p.category_id !== Number(categoryId)) return false;
      if (q && !p.product_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, type, categoryId, search]);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>
            Bid on treasures. <em>Buy</em> what you love.
          </h1>
          <p>
            LilamBazzar is Nepal's marketplace where live auctions meet everyday
            shopping — place a bid or grab it instantly.
          </p>
        </div>
      </section>

      <div className="container page" style={{ paddingTop: 0 }}>
        <div className="filter-bar">
          <div className="chip-row" role="group" aria-label="Product type">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`chip ${type === f.value ? 'active' : ''}`}
                onClick={() => setType(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name}
              </option>
            ))}
          </select>
          <input
            className="input search"
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <EmptyState icon="⚠️" title="Could not load the marketplace">
            {error}
          </EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState icon="🔍" title="No products match">
            Try a different search, category or filter.
          </EmptyState>
        ) : (
          <div className="grid-products">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
