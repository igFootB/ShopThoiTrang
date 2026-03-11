"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

export type CartItem = {
  id: number;
  productId: number;
  tenSanPham: string;
  hinhAnh: string;
  gia: number;
  variantId: number;
  size: string;
  mauSac: string;
  soLuong: number;
};

type CartApiResponse = {
  cartId: number;
  items: CartItem[];
  tongTien: number;
};

type CartContextValue = {
  cartCount: number;
  cartItems: CartItem[];
  cartTotal: number;
  refreshCartCount: () => Promise<void>;
  fetchCartItems: () => Promise<void>;
  increaseCartCount: (quantity?: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  const refreshCartCount = useCallback(async () => {
    try {
      const response = await api.get<CartApiResponse>("/cart");
      const count =
        response.data.items?.reduce((sum, item) => sum + (item.soLuong ?? 0), 0) ?? 0;
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, []);

  const fetchCartItems = useCallback(async () => {
    try {
      const response = await api.get<CartApiResponse>("/cart");
      setCartItems(response.data.items ?? []);
      setCartTotal(response.data.tongTien ?? 0);
      const count =
        response.data.items?.reduce((sum, item) => sum + (item.soLuong ?? 0), 0) ?? 0;
      setCartCount(count);
    } catch {
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
    }
  }, []);

  const increaseCartCount = useCallback((quantity = 1) => {
    setCartCount((prev) => prev + quantity);
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartTotal(0);
    setCartCount(0);
  }, []);

  const value = useMemo(
    () => ({
      cartCount,
      cartItems,
      cartTotal,
      refreshCartCount,
      fetchCartItems,
      increaseCartCount,
      clearCart,
    }),
    [cartCount, cartItems, cartTotal, refreshCartCount, fetchCartItems, increaseCartCount, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
