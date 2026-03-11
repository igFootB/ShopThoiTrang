"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useCart, type CartItem } from "@/components/providers/CartProvider";
import { formatVND } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight, Truck, Shield, ArrowLeft } from "lucide-react";

/* ─── Mock data fallback ─── */
const MOCK_CART: CartItem[] = [
  { id: 1, productId: 101, tenSanPham: "Áo Polo Nam Form Vừa Thoải Mái", hinhAnh: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=400&auto=format&fit=crop", gia: 450000, variantId: 2, size: "M", mauSac: "Trắng", soLuong: 2 },
  { id: 2, productId: 103, tenSanPham: "Quần Jeans Nam Dáng Suông", hinhAnh: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop", gia: 750000, variantId: 22, size: "30", mauSac: "Xanh đậm", soLuong: 1 },
  { id: 3, productId: 201, tenSanPham: "Đầm Xòe Nữ Dáng Dài Thanh Lịch", hinhAnh: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop", gia: 850000, variantId: 42, size: "M", mauSac: "Đỏ", soLuong: 1 },
];

export default function CartPage() {
  const { fetchCartItems, cartItems, cartTotal } = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchCartItems();
      } catch {
        /* ignore */
      }
      setLoading(false);
    };
    load();
  }, [fetchCartItems]);

  /* Sync với CartProvider hoặc fallback mock */
  useEffect(() => {
    if (!loading) {
      if (cartItems.length > 0) {
        setItems(cartItems);
        setTotal(cartTotal);
      } else {
        setItems(MOCK_CART);
        setTotal(MOCK_CART.reduce((s, i) => s + i.gia * i.soLuong, 0));
      }
    }
  }, [loading, cartItems, cartTotal]);

  /* Cập nhật số lượng */
  const handleUpdateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.soLuong + delta;
    if (newQty < 1) return;
    setUpdatingId(item.id);
    try {
      await api.put("/cart/update", { variantId: item.variantId, soLuong: newQty });
    } catch { /* fallback local */ }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, soLuong: newQty } : i))
    );
    setTotal((prev) => prev + delta * item.gia);
    setUpdatingId(null);
  };

  /* Xoá sản phẩm */
  const handleRemove = (item: CartItem) => {
    setRemovingId(item.id);
    setTimeout(async () => {
      try {
        await api.delete(`/cart/remove/${item.variantId}`);
      } catch { /* ignore */ }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setTotal((prev) => prev - item.gia * item.soLuong);
      setRemovingId(null);
    }, 300);
  };

  const shippingFee = total >= 500000 ? 0 : 30000;
  const grandTotal = total + shippingFee;

  return (
    <div className="bg-[#111] w-full min-h-screen">
      {/* ── Hero nhỏ ── */}
      <section className="relative w-full h-[160px] md:h-[200px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#111]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <ShoppingBag size={24} className="text-white" />
          </div>
          <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.2em]">
            Giỏ hàng
          </h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <ChevronRight size={10} />
          <span className="text-gray-300">Giỏ hàng ({items.reduce((s, i) => s + i.soLuong, 0)})</span>
        </nav>

        {loading ? (
          /* Loading skeleton */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 bg-[#1a1a1a] rounded-xl p-5 animate-pulse">
                <div className="w-24 h-28 bg-white/5 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Giỏ trống */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ShoppingBag size={36} className="text-gray-600" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">Giỏ hàng trống</h2>
            <p className="text-sm text-gray-500 mb-8">Hãy thêm sản phẩm yêu thích vào giỏ hàng nhé!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#b91c1c] text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-[#991b1b] transition-all"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ══ Cột trái: Danh sách sản phẩm ══ */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-4 bg-[#1a1a1a] rounded-xl p-4 md:p-5 border border-white/5 transition-all duration-300 ${
                    removingId === item.id ? "opacity-0 translate-x-4" : "opacity-100"
                  }`}
                >
                  {/* Ảnh */}
                  <Link href={`/product/${item.productId}`} className="relative w-20 h-24 md:w-24 md:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-[#222]">
                    <Image src={item.hinhAnh} alt={item.tenSanPham} fill unoptimized className="object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>

                  {/* Thông tin */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${item.productId}`}>
                        <h3 className="text-xs md:text-sm font-bold text-white leading-relaxed line-clamp-2 hover:text-gray-300 transition-colors">
                          {item.tenSanPham}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">
                        {item.mauSac} / {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Bộ chọn số lượng */}
                      <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
                        <button
                          onClick={() => handleUpdateQuantity(item, -1)}
                          disabled={item.soLuong <= 1 || updatingId === item.id}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-xs font-bold text-white border-x border-white/10">
                          {item.soLuong}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item, 1)}
                          disabled={updatingId === item.id}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Giá + xoá */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#b91c1c]">{formatVND(item.gia * item.soLuong)}</span>
                        <button
                          onClick={() => handleRemove(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tiếp tục mua sắm */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors mt-4"
              >
                <ArrowLeft size={14} /> Tiếp tục mua sắm
              </Link>
            </div>

            {/* ══ Cột phải: Tóm tắt đơn hàng ══ */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 sticky top-28">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.15em] mb-6">Tóm tắt đơn hàng</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tạm tính ({items.reduce((s, i) => s + i.soLuong, 0)} sản phẩm)</span>
                    <span className="text-white font-bold">{formatVND(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Phí vận chuyển</span>
                    <span className={`font-bold ${shippingFee === 0 ? "text-emerald-400" : "text-white"}`}>
                      {shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[10px] text-gray-500 italic">
                      Miễn phí vận chuyển cho đơn từ 500.000₫
                    </p>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm font-black text-white uppercase tracking-widest">Tổng cộng</span>
                    <span className="text-lg font-black text-[#b91c1c]">{formatVND(grandTotal)}</span>
                  </div>
                </div>

                {/* Nút thanh toán */}
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full h-12 bg-[#b91c1c] text-white text-sm font-black uppercase tracking-widest rounded-lg hover:bg-[#991b1b] active:scale-[0.98] transition-all"
                >
                  Thanh toán
                </Link>

                {/* Cam kết */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <Truck size={14} className="flex-shrink-0" />
                    <span>Miễn phí giao hàng đơn từ 500K</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <Shield size={14} className="flex-shrink-0" />
                    <span>Đổi trả miễn phí trong 30 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
