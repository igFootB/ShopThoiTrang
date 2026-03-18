"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { recommendationApi } from "@/lib/api";

export default function RecommendedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra đăng nhập
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);

    recommendationApi
      .getRecommendations()
      .then((res) => {
        if (Array.isArray(res?.data)) {
          setProducts(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Không render nếu chưa đăng nhập hoặc không có dữ liệu
  if (!isLoggedIn || (!loading && products.length === 0)) return null;

  // Hiện tối đa 8 sản phẩm; nếu không đủ 8 thì chỉ hiện 4
  const displayCount = products.length >= 8 ? 8 : 4;
  const displayProducts = products.slice(0, displayCount);

  // Nếu không đủ 4 sản phẩm thì không hiển thị
  if (!loading && products.length < 4) return null;

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 mb-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">✨</span>
          <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase">
            GỢI Ý CHO BẠN
          </h2>
          <span className="text-2xl">✨</span>
        </div>
        <p className="text-xs text-gray-400 tracking-wider uppercase">
          AI-Powered — Dựa trên sở thích cá nhân
        </p>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-[#222] aspect-[3/4] border border-[#333]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, idx) => (
            <ProductCard
              key={`rec-${product.id}-${idx}`}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}
