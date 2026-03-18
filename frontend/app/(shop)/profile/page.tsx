"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatVND } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

type OrderItem = {
  id: number;
  productId: number;
  tenSanPham: string;
  size: string;
  mauSac: string;
  soLuong: number;
  gia: number;
};

type Order = {
  id: number;
  maDonHang: string;
  ngayDat: string;
  tongTien: number;
  trangThai: string;
  items?: OrderItem[];
};

type ProfileData = {
  ten: string;
  email: string;
  soDienThoai: string;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-warning/20 text-warning",
  PROCESSING: "bg-processing/20 text-processing",
  SHIPPED: "bg-shipped/20 text-shipped",
  DELIVERED: "bg-success/20 text-success",
  CANCELLED: "bg-error/20 text-error",
  "Hoàn thành": "bg-success/20 text-success",
  "Đã giao": "bg-success/20 text-success"
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Cho xu ly",
  PROCESSING: "Dang xu ly",
  SHIPPED: "Dang giao",
  DELIVERED: "Da giao",
  CANCELLED: "Da huy",
  "Hoàn thành": "Hoàn thành",
  "Đã giao": "Đã giao"
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");

  /* ── Personal info ── */
  const [profile, setProfile] = useState<ProfileData>({
    ten: "",
    email: "",
    soDienThoai: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  /* ── Orders ── */
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<Record<number, OrderItem[]>>({});

  /* ── Reviews ── */
  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; productId?: number; orderId?: number; productName?: string }>({ isOpen: false });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  /* pre-fill profile from auth context */
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        ten: user.ten ?? "",
        email: user.email ?? "",
      }));
    }
  }, [user]);

  /* fetch profile from API */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<ProfileData>("/users/profile");
        setProfile(res.data ?? { ten: "", email: "", soDienThoai: "" });
      } catch {
        /* fallback to auth data */
      }
    };
    fetchProfile();
  }, []);

  /* fetch orders when tab switches */
  useEffect(() => {
    if (activeTab !== "orders") return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await api.get<Order[]>("/orders/my-orders");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await api.put("/users/profile", {
        ten: profile.ten,
        soDienThoai: profile.soDienThoai,
      });
      setSaveMsg("Cap nhat thanh cong!");
    } catch {
      setSaveMsg("Cap nhat that bai. Vui long thu lai.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDetails = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!orderDetails[orderId]) {
      try {
        const res = await api.get<{ items: OrderItem[] }>(`/orders/${orderId}`);
        setOrderDetails((prev) => ({ ...prev, [orderId]: res.data.items ?? [] }));
      } catch {
        setOrderDetails((prev) => ({ ...prev, [orderId]: [] }));
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal.productId || !reviewModal.orderId) return;
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Vui lòng chọn số sao hợp lệ");
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        productId: reviewModal.productId,
        orderId: reviewModal.orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success("Đánh giá sản phẩm thành công!");
      setReviewModal({ isOpen: false });
      setReviewForm({ rating: 5, comment: "" });
    } catch (error: any) {
      console.error("Lỗi khi gửi đánh giá:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  const tabs = [
    { key: "info" as const, label: "THÔNG TIN CÁ NHÂN" },
    { key: "orders" as const, label: "LỊCH SỬ ĐƠN HÀNG" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white">Tài khoản của tôi</h1>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition ${
              activeTab === tab.key
                ? "bg-[#b91c1c] text-white shadow-lg shadow-[#b91c1c]/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Personal Info ── */}
      {activeTab === "info" && (
        <section className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.15em] text-gray-300">Họ tên</label>
              <input
                type="text"
                value={profile.ten}
                onChange={(e) => setProfile((p) => ({ ...p, ten: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.15em] text-gray-300">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.15em] text-gray-300">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={profile.soDienThoai}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, soDienThoai: e.target.value }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] focus:outline-none transition-all"
                placeholder="0909 000 000"
              />
            </div>
          </div>

          {saveMsg && (
            <p
              className={`mt-3 text-sm ${
                saveMsg.includes("thanh cong")
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {saveMsg}
            </p>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="mt-5 rounded-xl bg-[#b91c1c] px-6 py-2.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(185,28,28,0.2)] transition-all hover:bg-[#991b1b] hover:shadow-[0_0_25px_rgba(185,28,28,0.4)] disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </section>
      )}

      {/* ── Tab: Orders ── */}
      {activeTab === "orders" && (
        <section className="space-y-4">
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#1a1a1a] border border-white/5" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-8 text-center text-gray-500">
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            orders.map((order) => {
              const statusStyle = STATUS_STYLES[order.trangThai] ?? "bg-white/10 text-gray-300";
              const statusLabel = STATUS_LABELS[order.trangThai] ?? order.trangThai;
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-[#1a1a1a]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-bold text-white">
                        #{order.maDonHang ?? order.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.ngayDat).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#b91c1c]">
                        {formatVND(order.tongTien)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
                      >
                        {statusLabel}
                      </span>
                      <button
                        onClick={() => handleToggleDetails(order.id)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-gray-300 transition hover:bg-white/5 hover:text-white"
                      >
                        {isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-white/10 px-5 pb-5 pt-3">
                      {orderDetails[order.id] ? (
                        orderDetails[order.id].length > 0 ? (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10 text-left text-xs text-gray-500 uppercase tracking-wider">
                                <th className="pb-2">Sản phẩm</th>
                                <th className="pb-2">Size / Màu</th>
                                <th className="pb-2 text-center">SL</th>
                                <th className="pb-2 text-right">Giá</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails[order.id].map((item) => (
                                <tr
                                  key={item.id}
                                  className="border-b border-white/5"
                                >
                                  <td className="py-2 font-medium text-white">
                                    {item.tenSanPham}
                                  </td>
                                  <td className="py-2 text-gray-400">
                                    {item.size} / {item.mauSac}
                                  </td>
                                  <td className="py-2 text-center text-gray-300">{item.soLuong}</td>
                                  <td className="py-2 text-right">
                                    <div className="flex flex-col items-end gap-2 text-[#b91c1c]">
                                      <span>{formatVND(item.gia * item.soLuong)}</span>
                                      {(order.trangThai === "DELIVERED" || order.trangThai === "Hoàn thành" || order.trangThai === "Đã giao") && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setReviewModal({
                                              isOpen: true,
                                              productId: item.productId,
                                              orderId: order.id,
                                              productName: item.tenSanPham
                                            });
                                            setReviewForm({ rating: 5, comment: "" });
                                          }}
                                          className="rounded border border-[#b91c1c]/50 px-2 py-1 text-[10px] font-bold text-[#b91c1c] uppercase tracking-wider transition hover:bg-[#b91c1c] hover:text-white"
                                        >
                                          Đánh giá
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Không có chi tiết đơn hàng.
                          </p>
                        )
                      ) : (
                        <p className="text-sm text-gray-500">Đang tải...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {/* ── Review Modal (Dark Mode) ── */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#1a1a1a] p-6 shadow-2xl border border-white/10">
            <h3 className="mb-2 text-xl font-black uppercase tracking-widest text-white">Đánh giá sản phẩm</h3>
            <p className="mb-6 text-sm text-gray-400">{reviewModal.productName}</p>

            <div className="mb-6 flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= reviewForm.rating
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "fill-transparent text-gray-600 hover:text-gray-500"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-white">Nhận xét của bạn</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                className="h-28 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-gray-500 transition-all focus:border-[#b91c1c] focus:outline-none focus:ring-1 focus:ring-[#b91c1c]"
                placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setReviewModal({ isOpen: false })}
                className="flex-[0.4] rounded-xl border border-white/10 bg-transparent py-3 text-sm font-bold uppercase tracking-wider text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 rounded-xl bg-[#b91c1c] py-3 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(185,28,28,0.2)] transition-all hover:bg-[#991b1b] hover:shadow-[0_0_25px_rgba(185,28,28,0.4)] disabled:opacity-50 active:scale-[0.98]"
              >
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
