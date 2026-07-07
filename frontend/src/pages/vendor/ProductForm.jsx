import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import ImageUploader from '../../components/ImageUploader.jsx';
import CategorySelect from '../../components/CategorySelect.jsx';
import Spinner from '../../components/Spinner.jsx';

/** ISO string → value usable by <input type="datetime-local"> (local time). */
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

const EMPTY = {
  product_name: '',
  description: '',
  stock: 1,
  category_id: '',
  fixed_price: '',
  base_price: '',
  auction_start_time: '',
  auction_end_time: '',
  min_increment: 10,
};

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [isAuction, setIsAuction] = useState(false);
  const [images, setImages] = useState([]);
  const [imagesTouched, setImagesTouched] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setIsAuction(data.is_auction);
        setForm({
          product_name: data.product_name,
          description: data.description || '',
          stock: data.stock,
          category_id: data.category_id ?? '',
          fixed_price: data.fixed_price ?? '',
          base_price: data.base_price ?? '',
          auction_start_time: toLocalInput(data.auction_start_time),
          auction_end_time: toLocalInput(data.auction_end_time),
          min_increment: Number(data.auction?.min_increment ?? 10),
        });
        setImages((data.ProductImage || []).map((i) => i.product_img));
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [editing, id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // every product needs a category (the DB requires it) — vendors can
    // create one inline from the picker if none fits
    if (!form.category_id) {
      setError('Please choose a category — or create one right from the list.');
      return;
    }

    // the API requires exactly one of fixed_price / base_price depending
    // on the product type — build the payload accordingly
    const payload = {
      product_name: form.product_name.trim(),
      description: form.description.trim() || undefined,
      stock: Number(form.stock),
      category_id: Number(form.category_id),
      is_auction: isAuction,
      ...(isAuction
        ? {
            base_price: Number(form.base_price),
            auction_start_time: new Date(form.auction_start_time).toISOString(),
            auction_end_time: new Date(form.auction_end_time).toISOString(),
            min_increment: Number(form.min_increment) || 10,
          }
        : {
            fixed_price: Number(form.fixed_price),
          }),
      // sending product_img replaces ALL existing images, so only include
      // it when the user actually changed them
      ...((!editing || imagesTouched) && images.length > 0 && {
        product_img: images,
      }),
    };

    if (
      isAuction &&
      new Date(payload.auction_end_time) <= new Date(payload.auction_start_time)
    ) {
      setError('Auction end time must be after the start time.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/products/${id}`, payload);
        toast('Listing updated');
      } else {
        await api.post('/products', payload);
        toast('Listing created');
      }
      navigate('/vendor/products');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <main className="container page" style={{ maxWidth: 680 }}>
      <div className="page-head">
        <div>
          <h1>{editing ? 'Edit listing' : 'New listing'}</h1>
          <p>
            {editing
              ? 'Update your product details.'
              : 'Sell at a fixed price, or run a timed auction.'}
          </p>
        </div>
        <Link to="/vendor/products" className="btn btn--ghost">
          ← Back to listings
        </Link>
      </div>

      <form className="card card__body" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label>Selling format</label>
          <div className="segmented">
            <button
              type="button"
              className={!isAuction ? 'active' : ''}
              onClick={() => setIsAuction(false)}
            >
              🛍️ Fixed price
            </button>
            <button
              type="button"
              className={isAuction ? 'active' : ''}
              onClick={() => setIsAuction(true)}
            >
              🔨 Auction
            </button>
          </div>
          {editing && (
            <span className="hint">
              Note: switching an active auction re-applies its base price and
              schedule.
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="product_name">Product name</label>
          <input
            id="product_name"
            className="input"
            required
            value={form.product_name}
            onChange={set('product_name')}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="input"
            value={form.description}
            onChange={set('description')}
            placeholder="Condition, history, what makes it special…"
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label>Category (required)</label>
            <CategorySelect
              value={String(form.category_id)}
              onChange={(id) => setForm((f) => ({ ...f, category_id: id }))}
            />
            <span className="hint">
              Don't see yours? Choose "Add new category…" to create it.
            </span>
          </div>
          <div className="field">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              className="input"
              type="number"
              min={0}
              required
              value={form.stock}
              onChange={set('stock')}
            />
          </div>
        </div>

        {isAuction ? (
          <>
            <div className="form-row">
              <div className="field">
                <label htmlFor="base_price">Starting price (Rs.)</label>
                <input
                  id="base_price"
                  className="input"
                  type="number"
                  min={1}
                  step="0.01"
                  required
                  value={form.base_price}
                  onChange={set('base_price')}
                />
              </div>
              <div className="field">
                <label htmlFor="min_increment">Minimum bid increment (Rs.)</label>
                <input
                  id="min_increment"
                  className="input"
                  type="number"
                  min={1}
                  step="0.01"
                  value={form.min_increment}
                  onChange={set('min_increment')}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="auction_start_time">Auction starts</label>
                <input
                  id="auction_start_time"
                  className="input"
                  type="datetime-local"
                  required
                  value={form.auction_start_time}
                  onChange={set('auction_start_time')}
                />
              </div>
              <div className="field">
                <label htmlFor="auction_end_time">Auction ends</label>
                <input
                  id="auction_end_time"
                  className="input"
                  type="datetime-local"
                  required
                  value={form.auction_end_time}
                  onChange={set('auction_end_time')}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="field">
            <label htmlFor="fixed_price">Price (Rs.)</label>
            <input
              id="fixed_price"
              className="input"
              type="number"
              min={1}
              step="0.01"
              required
              value={form.fixed_price}
              onChange={set('fixed_price')}
            />
          </div>
        )}

        <div className="field">
          <label>Photos</label>
          <ImageUploader
            images={images}
            multiple
            onChange={(next) => {
              setImages(next);
              setImagesTouched(true);
            }}
          />
          {editing && !imagesTouched && (
            <span className="hint">
              Leave untouched to keep the current photos.
            </span>
          )}
        </div>

        <button className="btn btn--accent btn--block" disabled={saving}>
          {saving
            ? 'Saving…'
            : editing
              ? 'Save changes'
              : isAuction
                ? '🔨 Launch auction'
                : 'Publish listing'}
        </button>
      </form>
    </main>
  );
}
