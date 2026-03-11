"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { formatVND } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Search, CreditCard, CheckCircle, RefreshCw, XCircle, SearchX } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPayments();
      // Đảm bảo dữ liệu là mảng
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Không thể tải danh sách thanh toán");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
      case "THÀNH CÔNG":
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20"><CheckCircle className="w-3 h-3" /> Thành công</span>;
      case "PENDING":
      case "CHỜ THANH TOÁN":
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"><RefreshCw className="w-3 h-3" /> Chờ xử lý</span>;
      case "FAILED":
      case "THẤT BẠI":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20"><XCircle className="w-3 h-3" /> Thất bại</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-600/20">{status || "—"}</span>;
    }
  };

  const getMethodBadge = (method: string) => {
    const isVNPay = method?.toUpperCase() === "VNPAY";
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md border ${
        isVNPay ? "text-blue-700 bg-blue-50 border-blue-200" : "text-gray-700 bg-white border-gray-300 shadow-sm"
      }`}>
        <CreditCard className="w-3 h-3" /> {method || "COD"}
      </span>
    );
  };

  const filteredPayments = payments.filter((p) => {
    // Tìm kiếm theo Mã Giao Dịch hoặc Mã Đơn Hàng hoặc Tên Khách
    const searchString = `${p.maGiaoDich || ""} ${p.maDonHang || ""} ${p.khachHang || ""}`.toLowerCase();
    const matchSearch = searchString.includes(search.toLowerCase());
    
    // Lọc theo Trạng thái
    let matchStatus = true;
    if (filterStatus !== "ALL") {
       matchStatus = p.trangThai?.toUpperCase() === filterStatus;
    }
    
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thanh toán</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi lịch sử giao dịch và đối soát thanh toán VNPAY/COD</p>
        </div>
        <button onClick={fetchPayments} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-md w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã giao dịch VNPAY, mã đơn hàng, khách hàng..."
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 sm:mt-0 flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { label: "Tất cả giao dịch", value: "ALL" },
              { label: "Thành công", value: "SUCCESS" },
              { label: "Chờ xử lý", value: "PENDING" },
              { label: "Thất bại", value: "FAILED" },
            ].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setFilterStatus(tab.value)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filterStatus === tab.value
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm focus:outline-none">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã Giao Dịch</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tham chiếu Đơn hàng</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kênh</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                      <p>Đang tải dữ liệu giao dịch...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <SearchX className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Không tìm thấy giao dịch nào.</h3>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  let formattedDate = "N/A";
                  if (payment.ngayThanhToan) {
                      try {
                        formattedDate = format(new Date(payment.ngayThanhToan), "dd/MM/yyyy HH:mm:ss");
                      } catch (e) { formattedDate = payment.ngayThanhToan; }
                  }

                  return (
                    <tr key={payment.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">{formattedDate}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-600">{payment.maGiaoDich !== "—" ? payment.maGiaoDich : "Chưa phát sinh"}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-semibold text-blue-600 cursor-pointer hover:underline">{payment.maDonHang}</span>
                            <span className="text-xs text-gray-500 mt-0.5">{payment.khachHang}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900">
                        {formatVND(payment.tongTien)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{getMethodBadge(payment.phuongThuc)}</td>
                      <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(payment.trangThai)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
