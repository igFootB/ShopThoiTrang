"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { wishlistApi } from "@/lib/api";
import { useAuth } from "./AuthProvider";

type WishlistContextValue = {
  wishlistIds: Set<number>;
  isLoading: boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const response = await wishlistApi.getWishlist();
      const ids = new Set<number>(response.data.map((item: any) => item.sanPham.id));
      setWishlistIds(ids);
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const toggleWishlist = useCallback(async (productId: number) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để sử dụng tính năng yêu thích.");
      return;
    }

    const isFav = wishlistIds.has(productId);
    
    try {
      if (isFav) {
        await wishlistApi.removeFromWishlist(productId);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await wishlistApi.addToWishlist(productId);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu thích:", error);
    }
  }, [isAuthenticated, wishlistIds]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlistIds.has(productId);
  }, [wishlistIds]);

  const value = useMemo(
    () => ({
      wishlistIds,
      isLoading,
      toggleWishlist,
      isInWishlist,
      refreshWishlist,
    }),
    [wishlistIds, isLoading, toggleWishlist, isInWishlist, refreshWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
