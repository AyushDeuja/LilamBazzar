import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CartContext = createContext(null);
const CART_KEY = 'lilam_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Cart holds fixed-price products only (auction wins check out directly
 * via their winning bid). Each item:
 * { product_id, name, price, image, stock, quantity }
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.product_id
            ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
            : i,
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  }, []);

  const updateQuantity = useCallback((product_id, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === product_id
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
          : i,
      ),
    );
  }, []);

  const removeItem = useCallback((product_id) => {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    return { items, count, total, addItem, updateQuantity, removeItem, clearCart };
  }, [items, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
