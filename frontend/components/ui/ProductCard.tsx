"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { formatVND } from "@/lib/utils";
 
export type ProductListItem = {
  id: number;
  tenSanPham: string;
  gia: number;
  thumbnail?: string | null;
};

type ProductCardProps = {
  product: ProductListItem;
};

export default function ProductCard({ product }: ProductCardProps) {
  // Use a tall portrait placeholder to match the design
  const image = product.thumbnail || `https://placehold.co/600x900/f3f4f6/333333?text=${encodeURIComponent(product.tenSanPham)}`;

  return (
    <article className="group flex flex-col cursor-pointer border border-[#333] hover:border-gray-500 transition-colors bg-[#1a1a1a] p-2">
      <div className="relative overflow-hidden bg-[#222] aspect-[3/4]">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image
            src={image}
            alt={product.tenSanPham}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
      </div>
      
      <div className="mt-3 flex flex-col px-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-[11px] lg:text-xs uppercase font-bold text-gray-300 group-hover:text-white transition-colors tracking-[0.1em] leading-relaxed mb-2">
            {product.tenSanPham}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm xl:text-[15px] font-bold text-white tracking-widest">{formatVND(product.gia)}</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 bg-white/5 hover:bg-[#b91c1c] hover:text-white transition-all">
              <Heart size={14} strokeWidth={2} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 bg-white/5 hover:bg-[#b91c1c] hover:text-white transition-all">
              <ShoppingCart size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
