"use client";

import { trackingApi } from "@/lib/api";

/**
 * Hook/utility để tracking hành vi người dùng (silent — không ảnh hưởng UX)
 */
export function trackView(productId: number) {
  trackingApi.logBehavior(productId, "VIEW");
}

export function trackAddToCart(productId: number) {
  trackingApi.logBehavior(productId, "ADD_TO_CART");
}

export function trackPurchase(productId: number) {
  trackingApi.logBehavior(productId, "PURCHASE");
}

export function trackWishlist(productId: number) {
  trackingApi.logBehavior(productId, "WISHLIST");
}
