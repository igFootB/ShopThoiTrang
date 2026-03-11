"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const res = await adminApi.getReviews();
            // Map the data correctly to fit UI expectations.
            // Entity DanhGia có: id, nguoiDung, sanPham, danhGia, binhLuan, ngayTao. (Không có trang_thai)
            const formatted = res.data.map((r: any) => ({
                id: r.id,
                customer: r.nguoiDung?.ten || "Khách ẩn danh",
                product: r.sanPham?.tenSanPham || "Sản phẩm đã xóa",
                rating: r.danhGia,
                comment: r.binhLuan,
                date: r.ngayTao ? new Date(r.ngayTao).toLocaleDateString("vi-VN") : "",
                status: "APPROVED" // Tạm thời hardcode vì DB không có `trang_thai` ẩn/duyệt
            }));
            setReviews(formatted);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách đánh giá");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa đánh giá này khỏi hệ thống?")) return;
        try {
            await adminApi.deleteReview(id);
            toast.success("Đã xóa đánh giá");
            fetchReviews();
        } catch (error) {
            toast.error("Lỗi khi xóa đánh giá");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý phản hồi của khách hàng về sản phẩm</p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm focus:outline-none">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách Hàng / Ngày</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đánh giá</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Không có đánh giá nào.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-blue-50/50">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{review.customer}</p>
                                            <p className="text-xs text-gray-500">{review.date}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-blue-600">{review.product}</span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex items-center text-amber-400 mb-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <svg key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium truncate" title={review.comment}>
                                                "{review.comment}"
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {review.status === "APPROVED" ? (
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Đã hiện</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Chờ duyệt</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            {/* Entity hiện tại không có trường ẩn, nên chỉ hỗ trợ Xóa cứng */}
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                                                title="Xóa vĩnh viễn"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
