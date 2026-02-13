"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartItem = {
  variantId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  setQuantity: (variantId: string, quantity: number) => void;
  addItem: (variantId: string, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "nestfoodsltd_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

function sanitize(items: CartItem[]) {
  return items
    .map((item) => ({
      variantId: item.variantId,
      quantity: Math.max(1, Math.min(99, Math.floor(item.quantity))),
    }))
    .filter((item) => item.variantId.length > 0);
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(sanitize(parsed));
      } catch {
        setItems([]);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((current) => {
      const existing = current.find((item) => item.variantId === variantId);
      if (!existing && quantity > 0) {
        return sanitize([...current, { variantId, quantity }]);
      }
      const filtered = current
        .map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);
      return sanitize(filtered);
    });
  }, []);

  const addItem = useCallback((variantId: string, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.variantId === variantId);
      if (!existing) {
        return sanitize([...current, { variantId, quantity }]);
      }
      return sanitize(
        current.map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item,
        ),
      );
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      setQuantity,
      addItem,
      removeItem,
      clear,
    }),
    [addItem, clear, items, removeItem, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return context;
}
