"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { formatVND } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Search, Filter, ShoppingBag, Eye, CheckCircle, Clock, Truck, XCircle, Package } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders();
      // The API returns an array directly, or inside res.data based on Axios setup.
      setOrders(res.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
      case "Chờ xác nhận":
      case "Chờ thanh toán":
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"><Clock className="w-3 h-3" /> Chờ duyệt</span>;
      case "PROCESSING":
      case "Đang xử lý":
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20"><Package className="w-3 h-3" /> Đang chuẩn bị</span>;
      case "SHIPPED":
      case "Đang giao hàng":
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20"><Truck className="w-3 h-3" /> Đang giao</span>;
      case "DELIVERED":
      case "Hoàn thành":
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-600/20"><CheckCircle className="w-3 h-3" /> Đã hoàn thành</span>;
      case "CANCELLED":
      case "Đã hủy":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20"><XCircle className="w-3 h-3" /> Đã hủy</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-800 ring-1 ring-inset ring-gray-600/20">{status || "Không xác định"}</span>;
    }
  };

  const updateOrderStatus = async (id: number, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      // Update local state to avoid refetching
      setOrders(orders.map(o => o.id === id ? { ...o, trangThai: newStatus } : o));
      if (currentOrder && currentOrder.id === id) {
        setCurrentOrder({ ...currentOrder, trangThai: newStatus });
      }
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const searchString = `${o.maDonHang} ${o.khachHang}`.toLowerCase();
    const matchSearch = searchString.includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" ||
      (filterStatus === "PENDING" && (o.trangThai === "Chờ xác nhận" || o.trangThai === "PENDING" || o.trangThai === "Chờ thanh toán")) ||
      (filterStatus === "PROCESSING" && (o.trangThai === "Đang xử lý" || o.trangThai === "PROCESSING")) ||
      (filterStatus === "COMPLETED" && (o.trangThai === "Hoàn thành" || o.trangThai === "DELIVERED" || o.trangThai === "Đã giao"));
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và xử lý đơn hàng của hệ thống</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã đơn hàng hoặc tên khách..."
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 sm:mt-0 flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { label: "Tất cả", value: "ALL" },
              { label: "Chờ duyệt", value: "PENDING" },
              { label: "Đang xử lý", value: "PROCESSING" },
              { label: "Hoàn thành", value: "COMPLETED" },
            ].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setFilterStatus(tab.value)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filterStatus === tab.value
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
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
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã Đơn</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách Hàng</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày Đặt</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng Tiền</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <ShoppingBag className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Không có đơn hàng nào</h3>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  let formattedDate = "";
                  try {
                    formattedDate = format(new Date(order.ngayDat), "dd/MM/yyyy HH:mm");
                  } catch (e) { formattedDate = order.ngayDat; }

                  return (
                    <tr key={order.id} className="hover:bg-blue-50/50">
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-blue-600">{order.maDonHang}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-900 font-medium">{order.khachHang}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">{formattedDate}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                        {formatVND(order.tongTien)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(order.trangThai)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          onClick={async () => {
                            try {
                              const detailRes = await adminApi.getOrderDetail(order.id);
                              setCurrentOrder(detailRes.data);
                              setDetailModalOpen(true);
                            } catch {
                              toast.error("Không thể tải chi tiết đơn hàng");
                            }
                          }}
                          className="text-white hover:bg-blue-700 bg-blue-600 font-medium text-xs rounded-lg px-3 py-2 transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-4 h-4" /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Order Detail Modal */}
      {detailModalOpen && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col md:overflow-hidden">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4 bg-gray-50 shrink-0 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Đơn hàng {currentOrder.maDonHang}
                </h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentOrder.ngayDat}
                </p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                title="Đóng"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* Customer Info Box */}
              <div className="bg-white border text-sm border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2">Thông tin khách hàng</h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider">Tên khách hàng</p>
                    <p className="font-medium text-gray-900">{currentOrder.khachHang}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider">Phương thức thanh toán</p>
                    <p className="font-medium text-gray-900">{currentOrder.phuongThucThanhToan || "COD"}</p>
                  </div>
                </div>
              </div>

              {/* Order Status Timeline / Update */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Cập nhật Trạng thái</h3>
                <div className="flex flex-wrap gap-2">
                  {["Chờ xác nhận", "Đang xử lý", "Đang giao hàng", "Hoàn thành", "Đã hủy"].map((st) => (
                    <button
                      key={st}
                      onClick={() => updateOrderStatus(currentOrder.id, st)}
                      disabled={currentOrder.trangThai === st}
                      className={`text-xs px-3 py-1.5 font-medium rounded-full transition-colors border ${currentOrder.trangThai === st
                        ? 'bg-blue-600 border-blue-600 text-white cursor-default'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border text-sm border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Danh sách sản phẩm</h3>
                <div className="space-y-4">
                  {currentOrder.items && currentOrder.items.length > 0 ? (
                    currentOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4">
                        {item.hinhAnh ? (
                          <img src={`http://localhost:8080/api/public/files/${item.hinhAnh}`} alt={item.sanPhamTen} className="w-16 h-16 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">{item.sanPhamTen}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Màu: {item.mauSac} - Size: {item.kichThuoc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatVND(item.donGia)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">x {item.soLuong}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs italic">Không có chi tiết sản phẩm.</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <span className="font-medium text-gray-600">Tổng tiền thanh toán:</span>
                <span className="text-xl font-bold text-blue-600">{formatVND(currentOrder.tongTien)}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
              >
                Đóng Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
