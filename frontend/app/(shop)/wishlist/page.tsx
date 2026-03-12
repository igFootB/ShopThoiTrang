"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Trash2, ChevronRight } from "lucide-react";
import { formatVND } from "@/lib/utils";

type WishlistItem = {
  id: number;
  tenSanPham: string;
  gia: number;
  thumbnail: string;
};

/* ─── Dữ liệu mẫu yêu thích ─── */
const INITIAL_WISHLIST: WishlistItem[] = [
  { id: 101, tenSanPham: "Áo Polo Nam Form Vừa Thoải Mái", gia: 450000, thumbnail: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=400&auto=format&fit=crop" },
  { id: 103, tenSanPham: "Quần Jeans Nam Dáng Suông", gia: 750000, thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop" },
  { id: 201, tenSanPham: "Đầm Xòe Nữ Dáng Dài Thanh Lịch", gia: 850000, thumbnail: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop" },
  { id: 104, tenSanPham: "Áo Khoác Nam Phom Dài Thanh Lịch", gia: 1250000, thumbnail: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop" },
];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      setRemovingId(null);
    }, 300);
  };

  return (
    <div className="bg-[#111] w-full min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[200px] md:h-[280px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#111]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 rounded-full bg-[#b91c1c]/10 flex items-center justify-center mb-4">
            <Heart size={28} className="text-[#b91c1c]" fill="#b91c1c" />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-[0.2em] mb-2">
            Yêu thích
          </h1>
          <p className="text-sm text-gray-500 tracking-wider">
            {items.length} sản phẩm đã lưu
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <ChevronRight size={10} />
          <span className="text-gray-300">Yêu thích</span>
        </nav>

        {items.length === 0 ? (
          /* ── Trống ── */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Heart size={36} className="text-gray-600" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">Chưa có sản phẩm yêu thích</h2>
            <p className="text-sm text-gray-500 mb-8">Hãy khám phá và lưu lại những sản phẩm bạn yêu thích nhé!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#b91c1c] text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-[#991b1b] transition-all"
            >
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <>
            {/* ── Danh sách dạng bảng (Desktop) ── */}
            <div className="hidden md:block">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] border-b border-white/10">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Trạng thái</div>
                <div className="col-span-2 text-center">Thao tác</div>
              </div>

              {/* Rows */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-4 items-center px-6 py-5 border-b border-white/5 hover:bg-white/[0.02] transition-all ${
                    removingId === item.id ? "opacity-0 translate-x-4" : "opacity-100"
                  }`}
                  style={{ transition: "opacity 0.3s, transform 0.3s" }}
                >
                  {/* Sản phẩm */}
                  <div className="col-span-6 flex items-center gap-4">
                    <div onClick={() => window.location.href = `/product/${item.id}`} className="relative w-20 h-24 rounded-md overflow-hidden flex-shrink-0 bg-[#1a1a1a] cursor-pointer">
                      <Image src={item.thumbnail} alt={item.tenSanPham} fill unoptimized className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div onClick={() => window.location.href = `/product/${item.id}`} className="hover:text-gray-300 transition-colors cursor-pointer">
                      <h3 className="text-sm font-bold text-white leading-relaxed line-clamp-2">{item.tenSanPham}</h3>
                    </div>
                  </div>

                  {/* Giá */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold text-[#b91c1c]">{formatVND(item.gia)}</span>
                  </div>

                  {/* Trạng thái */}
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Còn hàng
                    </span>
                  </div>

                  {/* Thao tác */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.location.href = `/product/${item.id}`}
                      className="w-9 h-9 flex items-center justify-center rounded-md bg-[#b91c1c] text-white hover:bg-[#991b1b] transition-all cursor-pointer relative z-40"
                      title="Xem sản phẩm"
                    >
                      <ShoppingCart size={14} className="pointer-events-none" />
                    </button>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Xóa Desktop => ID:", item.id);
                        handleRemove(item.id);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-md bg-white/5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer relative z-[9999] pointer-events-auto"
                      title="Xoá khỏi yêu thích"
                    >
                      <Trash2 size={14} className="pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Danh sách dạng card (Mobile) ── */}
            <div className="md:hidden space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-4 bg-[#1a1a1a] rounded-xl p-4 border border-white/5 transition-all relative ${
                    removingId === item.id ? "opacity-0 scale-95" : "opacity-100"
                  }`}
                  style={{ transition: "opacity 0.3s, transform 0.3s" }}
                >
                  <div onClick={() => window.location.href = `/product/${item.id}`} className="relative w-20 h-24 rounded-md overflow-hidden flex-shrink-0 bg-[#222] cursor-pointer">
                    <Image src={item.thumbnail} alt={item.tenSanPham} fill unoptimized className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div onClick={() => window.location.href = `/product/${item.id}`} className="cursor-pointer">
                        <h3 className="text-xs font-bold text-white leading-relaxed line-clamp-2">{item.tenSanPham}</h3>
                      </div>
                      <p className="text-sm font-bold text-[#b91c1c] mt-1">{formatVND(item.gia)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => window.location.href = `/product/${item.id}`}
                        className="flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md bg-[#b91c1c] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#991b1b] transition-all cursor-pointer relative z-40"
                      >
                        <ShoppingCart size={12} className="pointer-events-none" /> Mua ngay
                      </button>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Xóa Mobile => ID:", item.id);
                          handleRemove(item.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white/5 text-gray-500 hover:text-red-400 transition-all cursor-pointer relative z-[9999] pointer-events-auto"
                      >
                        <Trash2 size={13} className="pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Footer actions ── */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/"
                className="text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                ← Tiếp tục mua sắm
              </Link>
              <button
                onClick={() => setItems([])}
                className="text-[11px] font-bold text-gray-500 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Xoá tất cả yêu thích
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
