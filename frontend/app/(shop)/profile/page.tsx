"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatVND } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

type OrderItem = {
  id: number;
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
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Cho xu ly",
  PROCESSING: "Dang xu ly",
  SHIPPED: "Dang giao",
  DELIVERED: "Da giao",
  CANCELLED: "Da huy",
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

  const tabs = [
    { key: "info" as const, label: "Thong tin ca nhan" },
    { key: "orders" as const, label: "Lich su don hang" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Tai khoan cua toi</h1>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Personal Info ── */}
      {activeTab === "info" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ho ten</label>
              <input
                type="text"
                value={profile.ten}
                onChange={(e) => setProfile((p) => ({ ...p, ten: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                So dien thoai
              </label>
              <input
                type="tel"
                value={profile.soDienThoai}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, soDienThoai: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                placeholder="0909 000 000"
              />
            </div>
          </div>

          {saveMsg && (
            <p
              className={`mt-3 text-sm ${
                saveMsg.includes("thanh cong")
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {saveMsg}
            </p>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="mt-5 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "Dang luu..." : "Luu thay doi"}
          </button>
        </section>
      )}

      {/* ── Tab: Orders ── */}
      {activeTab === "orders" && (
        <section className="space-y-4">
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Ban chua co don hang nao.
            </div>
          ) : (
            orders.map((order) => {
              const statusStyle = STATUS_STYLES[order.trangThai] ?? "bg-slate-100 text-slate-800";
              const statusLabel = STATUS_LABELS[order.trangThai] ?? order.trangThai;
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-semibold text-slate-900">
                        #{order.maDonHang ?? order.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.ngayDat).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-amber-600">
                        {formatVND(order.tongTien)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
                      >
                        {statusLabel}
                      </span>
                      <button
                        onClick={() => handleToggleDetails(order.id)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {isExpanded ? "An chi tiet" : "Xem chi tiet"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-3">
                      {orderDetails[order.id] ? (
                        orderDetails[order.id].length > 0 ? (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                                <th className="pb-2">San pham</th>
                                <th className="pb-2">Size / Mau</th>
                                <th className="pb-2 text-center">SL</th>
                                <th className="pb-2 text-right">Gia</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails[order.id].map((item) => (
                                <tr
                                  key={item.id}
                                  className="border-b border-slate-50"
                                >
                                  <td className="py-2 font-medium text-slate-900">
                                    {item.tenSanPham}
                                  </td>
                                  <td className="py-2 text-slate-600">
                                    {item.size} / {item.mauSac}
                                  </td>
                                  <td className="py-2 text-center">{item.soLuong}</td>
                                  <td className="py-2 text-right text-amber-600">
                                    {formatVND(item.gia * item.soLuong)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-slate-500">
                            Khong co chi tiet don hang.
                          </p>
                        )
                      ) : (
                        <p className="text-sm text-slate-500">Dang tai...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
