"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart, type CartItem } from "@/components/providers/CartProvider";
import { formatVND } from "@/lib/utils";
import { ChevronRight, Truck, Shield, CreditCard, Banknote, MapPin, Check, Plus, X } from "lucide-react";



export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, fetchCartItems, clearCart } = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Voucher */
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  /* Form giao hàng */
  const [hoTen, setHoTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [email, setEmail] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");

  /* Address Selection */
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isBuyNow, setIsBuyNow] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch addresses
        const addrRes = await api.get("/addresses");
        if (addrRes.data && Array.isArray(addrRes.data)) {
          setAddresses(addrRes.data);
          const defaultAddr = addrRes.data.find((a: any) => a.isDefault === 1);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (addrRes.data.length > 0) setSelectedAddressId(addrRes.data[0].id);
          else setShowNewAddressForm(true);
        }

        // Check buy now
        const buyNowStr = sessionStorage.getItem("buyNowItem");
        if (buyNowStr) {
          setIsBuyNow(true);
          const buyNowItem = JSON.parse(buyNowStr);
          // Gắn id fake để render
          setItems([{ ...buyNowItem, id: 999999 }]);
          setTotal(buyNowItem.gia * buyNowItem.soLuong);
        } else {
          setIsBuyNow(false);
          await fetchCartItems();
        }
      } catch {
        setShowNewAddressForm(true);
      }
      setLoading(false);
    };
    load();
  }, [fetchCartItems]);

  useEffect(() => {
    if (!loading && !isBuyNow) {
      setItems(cartItems);
      setTotal(cartTotal);
    }
  }, [loading, cartItems, cartTotal, isBuyNow]);

  const shippingFee = total >= 500000 ? 0 : 30000;
  
  const discountAmount = appliedVoucher 
    ? (appliedVoucher.loaiGiamGia === "PERCENT" 
        ? (total * appliedVoucher.giaTriGiam) / 100 
        : appliedVoucher.giaTriGiam) 
    : 0;
  
  const actualDiscount = Math.min(total, discountAmount);
  const grandTotal = total - actualDiscount + shippingFee;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsApplyingVoucher(true);
    setVoucherError(null);
    try {
      const res = await api.get(`/public/coupons/check?code=${voucherCode.trim()}&total=${total}`);
      setAppliedVoucher(res.data);
      setVoucherCode(""); // clear input
    } catch (err: any) {
      setVoucherError(err.response?.data?.message || "Mã giảm giá không hợp lệ");
      setAppliedVoucher(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let finalAddressId = selectedAddressId;

      // Xử lý tạo địa chỉ mới nếu đang ở form
      if (showNewAddressForm) {
        if (!hoTen || !sdt || !diaChi) {
          setError("Vui lòng điền đủ thông tin giao hàng.");
          setSubmitting(false);
          return;
        }
        // Gọi API tạo địa chỉ
        const newAddrRes = await api.post("/addresses", {
          tenNguoiNhan: hoTen,
          soDienThoai: sdt,
          diaChi: diaChi,
          thanhPho: "Hồ Chí Minh", // Tạm hardcode hoặc để trống nếu mock, theo AddressRequest cần thanhPho
          isDefault: 1
        });
        finalAddressId = newAddrRes.data.id;
      }

      if (!finalAddressId) {
        setError("Vui lòng chọn hoặc thêm địa chỉ giao hàng.");
        setSubmitting(false);
        return;
      }

      const payload: any = {
        addressId: finalAddressId,
        paymentMethod,
        phiVanChuyen: shippingFee,
        items: items.map((i) => ({ variantId: i.variantId, soLuong: i.soLuong })),
      };

      if (appliedVoucher) {
        payload.couponId = appliedVoucher.id;
      }
      
      const res = await api.post("/orders/checkout", payload);
      
      if (isBuyNow) {
        sessionStorage.removeItem("buyNowItem");
      } else {
        clearCart();
      }

      if (paymentMethod === "VNPAY" && res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        router.push("/thank-you");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#111] w-full min-h-screen">
      {/* Hero nhỏ */}
      <section className="relative w-full h-[120px] md:h-[160px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#111]" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-[0.2em]">Thanh toán</h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <ChevronRight size={10} />
          <Link href="/cart" className="hover:text-white transition-colors">Giỏ hàng</Link>
          <ChevronRight size={10} />
          <span className="text-gray-300">Thanh toán</span>
        </nav>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">{[1,2,3].map(i=><div key={i} className="h-16 bg-[#1a1a1a] rounded-xl animate-pulse"/>)}</div>
            <div className="lg:col-span-2"><div className="h-64 bg-[#1a1a1a] rounded-xl animate-pulse"/></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ══ Cột trái: Thông tin giao hàng ══ */}
            <div className="lg:col-span-3 space-y-6">

              {/* Thông tin người nhận */}
              <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-[0.15em]">
                    <MapPin size={16} className="text-[#b91c1c]" /> Thông tin giao hàng
                  </h3>
                  {addresses.length > 0 && !showNewAddressForm && (
                     <button type="button" onClick={() => setShowNewAddressForm(true)} className="text-[10px] sm:text-xs font-bold text-[#b91c1c] hover:text-[#ff4d4d] uppercase tracking-widest flex items-center gap-1 transition-colors">
                       <Plus size={14}/> Thêm địa chỉ mới
                     </button>
                  )}
                  {showNewAddressForm && addresses.length > 0 && (
                     <button type="button" onClick={() => setShowNewAddressForm(false)} className="text-[10px] sm:text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors">
                       Hủy thêm mới
                     </button>
                  )}
                </div>

                {!showNewAddressForm && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${selectedAddressId === addr.id ? "border-[#b91c1c] bg-[#b91c1c]/5" : "border-white/10 hover:border-white/20"}`}>
                        <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="sr-only" />
                        <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAddressId === addr.id ? "border-[#b91c1c]" : "border-white/20"}`}>
                          {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-[#b91c1c]" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-white mb-1">
                            {addr.tenNguoiNhan} <span className="text-gray-500 font-normal">| {addr.soDienThoai}</span>
                            {addr.isDefault === 1 && <span className="ml-3 inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-[#b91c1c] text-white tracking-widest uppercase">Mặc định</span>}
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed">{addr.diaChi}, {addr.thanhPho}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1.5">Họ tên *</label>
                      <input value={hoTen} onChange={e=>setHoTen(e.target.value)} required placeholder="Nguyễn Văn A"
                        className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-2.5 px-4 focus:outline-none focus:border-white/30 placeholder:text-gray-600 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1.5">Số điện thoại *</label>
                      <input value={sdt} onChange={e=>setSdt(e.target.value)} required placeholder="0901 234 567"
                        className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-2.5 px-4 focus:outline-none focus:border-white/30 placeholder:text-gray-600 transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1.5">Địa chỉ giao hàng (Tỉnh/Thành, Số nhà...) *</label>
                      <input value={diaChi} onChange={e=>setDiaChi(e.target.value)} required placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                        className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-2.5 px-4 focus:outline-none focus:border-white/30 placeholder:text-gray-600 transition-colors" />
                    </div>
                  </div>
                )}
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6">
                <h3 className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-[0.15em] mb-5">
                  <CreditCard size={16} className="text-[#b91c1c]" /> Phương thức thanh toán
                </h3>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "COD" ? "border-[#b91c1c] bg-[#b91c1c]/5" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input type="radio" name="payment" value="COD" checked={paymentMethod==="COD"} onChange={()=>setPaymentMethod("COD")} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod==="COD" ? "border-[#b91c1c]" : "border-white/20"}`}>
                      {paymentMethod==="COD" && <div className="w-2.5 h-2.5 rounded-full bg-[#b91c1c]" />}
                    </div>
                    <Banknote size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Kiểm tra hàng trước khi thanh toán</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === "VNPAY" ? "border-[#b91c1c] bg-[#b91c1c]/5" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input type="radio" name="payment" value="VNPAY" checked={paymentMethod==="VNPAY"} onChange={()=>setPaymentMethod("VNPAY")} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod==="VNPAY" ? "border-[#b91c1c]" : "border-white/20"}`}>
                      {paymentMethod==="VNPAY" && <div className="w-2.5 h-2.5 rounded-full bg-[#b91c1c]" />}
                    </div>
                    <CreditCard size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">Thanh toán qua VNPay</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">ATM, Visa, MasterCard, QR Code</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ══ Cột phải: Đơn hàng ══ */}
            <div className="lg:col-span-2">
              <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 sticky top-28">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.15em] mb-5">Đơn hàng của bạn</h3>

                {/* Danh sách SP */}
                <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-16 rounded-md overflow-hidden flex-shrink-0 bg-[#222]">
                        <Image src={item.hinhAnh} alt={item.tenSanPham} fill unoptimized className="object-cover" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#b91c1c] text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                          {item.soLuong}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white line-clamp-1">{item.tenSanPham}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.mauSac} / {item.size}</p>
                      </div>
                      <span className="text-xs font-bold text-white flex-shrink-0">{formatVND(item.gia * item.soLuong)}</span>
                    </div>
                  ))}
                </div>

                {/* Tổng */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tạm tính</span>
                    <span className="text-white font-bold">{formatVND(total)}</span>
                  </div>
                  
                  {/* Phần nhập Voucher */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={voucherCode} 
                        onChange={(e) => setVoucherCode(e.target.value)} 
                        placeholder="Nhập mã giảm giá..." 
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white py-2 px-3 focus:outline-none focus:border-[#b91c1c] uppercase"
                      />
                      <button 
                        type="button" 
                        onClick={handleApplyVoucher}
                        disabled={isApplyingVoucher || !voucherCode.trim()}
                        className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        {isApplyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
                      </button>
                    </div>
                    {voucherError && <p className="text-red-400 text-xs mt-2">{voucherError}</p>}
                    
                    {appliedVoucher && (
                      <div className="mt-3 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <div>
                          <p className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
                            <Check size={14} /> {appliedVoucher.maGiamGia}
                          </p>
                          <p className="text-gray-400 text-[10px] mt-0.5">
                            Đã giảm {appliedVoucher.loaiGiamGia === "PERCENT" ? `${appliedVoucher.giaTriGiam}%` : formatVND(appliedVoucher.giaTriGiam)}
                          </p>
                        </div>
                        <button type="button" onClick={removeVoucher} className="text-gray-500 hover:text-red-400 p-1 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-gray-400">Phí vận chuyển</span>
                    <span className={`font-bold ${shippingFee===0 ? "text-emerald-400" : "text-white"}`}>
                      {shippingFee===0 ? "Miễn phí" : formatVND(shippingFee)}
                    </span>
                  </div>

                  {actualDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Giảm giá</span>
                      <span className="font-bold text-emerald-400">- {formatVND(actualDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-black text-white uppercase tracking-widest">Tổng cộng</span>
                    <span className="text-lg font-black text-[#b91c1c]">{formatVND(grandTotal)}</span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Nút đặt hàng */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`mt-5 flex items-center justify-center gap-2 w-full h-12 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${
                    submitting
                      ? "bg-white/10 text-gray-500 cursor-not-allowed"
                      : "bg-[#b91c1c] text-white hover:bg-[#991b1b] active:scale-[0.98]"
                  }`}
                >
                  {submitting ? "Đang xử lý..." : (
                    <><Check size={16} /> Đặt hàng</>
                  )}
                </button>

                {/* Cam kết */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <Truck size={14} className="flex-shrink-0" />
                    <span>Giao hàng nhanh 2-5 ngày</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <Shield size={14} className="flex-shrink-0" />
                    <span>Đổi trả miễn phí trong 30 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
