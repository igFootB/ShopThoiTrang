"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { TrendingUp, Users, ShoppingCart, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardParams = async () => {
      try {
        const res = await adminApi.getDashboard();
        setData(res.data);
      } catch (error) {
        toast.error("Không thể tải dữ liệu Thống kê");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardParams();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const stats = [
    {
      name: "Tổng Doanh Thu",
      value: data ? formatCurrency(data.doanhThuThangNay) : "0 ₫",
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />
    },
    {
      name: "Tổng Đơn Hàng",
      value: data?.tongSoDonHang || 0,
      icon: <ShoppingCart className="h-6 w-6 text-blue-600" />
    },
    {
      name: "Tổng Khách Hàng",
      value: data?.tongSoKhachHang || 0,
      icon: <Users className="h-6 w-6 text-blue-600" />
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">
          Xem thông tin nhanh về hiệu suất kinh doanh của cửa hàng trong tháng {data?.thangThongKe || "..."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <dt>
              <div className="absolute rounded-lg bg-blue-50 p-3">
                {stat.icon}
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1">
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : stat.value}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 5 Bán Chạy Nhất Tháng */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Sản phẩm bán chạy nhất tháng</h2>
          </div>
          <div className="flow-root">
            {loading ? (
              <p className="text-gray-500 py-4 text-center">Đang tải biểu đồ dữ liệu...</p>
            ) : (!data?.topSanPhamBanChay || data.topSanPhamBanChay.length === 0) ? (
              <p className="text-gray-500 py-4 text-center">Chưa có dữ liệu bán hàng tháng này.</p>
            ) : (
              <ul className="-my-5 divide-y divide-gray-100">
                {data.topSanPhamBanChay.map((sp: any, index: number) => (
                  <li key={sp.productId} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600 font-bold text-lg">
                        #{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{sp.productName}</p>
                        <p className="truncate text-sm text-gray-500">Mã: {sp.productId}</p>
                      </div>
                      <div>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          Đã bán {sp.totalSold} sp
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
