"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { recommendationApi } from "@/lib/api";

type SimilarProductsProps = {
  productId: number;
};

export default function SimilarProducts({ productId }: SimilarProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    recommendationApi
      .getSimilarProducts(productId, 4)
      .then((res) => {
        if (Array.isArray(res?.data)) {
          setProducts(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 mt-16 mb-16">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-lg md:text-xl font-black tracking-widest uppercase">
          SẢN PHẨM TƯƠNG TỰ
        </h2>
        <div className="w-16 h-[2px] bg-[#b91c1c] mx-auto mt-3" />
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
          {products.map((product, idx) => (
            <ProductCard
              key={`similar-${product.id}-${idx}`}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}
