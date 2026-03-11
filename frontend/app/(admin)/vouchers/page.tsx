"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { Gift, Trash2, Plus, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [editingVoucher, setEditingVoucher] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        maGiamGia: "",
        loaiGiamGia: "PERCENT",
        giaTriGiam: 0,
        donToiThieu: 0,
        soLuongConLai: 0,
        ngayHetHan: "",
        trangThai: 1
    });

    const openAddModal = () => {
        setModalMode("add");
        setFormData({
            maGiamGia: "",
            loaiGiamGia: "PERCENT",
            giaTriGiam: 0,
            donToiThieu: 0,
            soLuongConLai: 0,
            ngayHetHan: "",
            trangThai: 1
        });
        setIsModalOpen(true);
    };

    const openEditModal = (voucher: any) => {
        setModalMode("edit");
        setEditingVoucher(voucher);
        // Format datetime to valid input type="datetime-local" string
        const formattedDate = voucher.ngayHetHan ? new Date(voucher.ngayHetHan).toISOString().slice(0, 16) : "";
        setFormData({
            maGiamGia: voucher.maGiamGia || "",
            loaiGiamGia: voucher.loaiGiamGia || "PERCENT",
            giaTriGiam: voucher.giaTriGiam || 0,
            donToiThieu: voucher.donToiThieu || 0,
            soLuongConLai: voucher.soLuongConLai || 0,
            ngayHetHan: formattedDate,
            trangThai: voucher.trangThai ?? 1
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVoucher(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                ngayHetHan: formData.ngayHetHan ? new Date(formData.ngayHetHan).toISOString() : null
            };

            if (modalMode === "add") {
                await adminApi.createCoupon(payload);
                toast.success("Thêm mã giảm giá thành công");
            } else {
                await adminApi.updateCoupon(editingVoucher.id, payload);
                toast.success("Cập nhật mã giảm giá thành công");
            }
            closeModal();
            fetchVouchers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Lỗi khi ${modalMode === "add" ? "thêm" : "cập nhật"}`);
        } finally {
            setSubmitting(false);
        }
    };

    const fetchVouchers = async () => {
        try {
            const res = await adminApi.getCoupons();
            setVouchers(res.data);
        } catch (error) {
            toast.error("Không thể tải danh sách khuyến mãi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn ẩn/xóa mã khuyến mãi này?")) return;
        try {
            await adminApi.deleteCoupon(id);
            toast.success("Đã ẩn/xóa mã khuyến mãi");
            fetchVouchers();
        } catch (error) {
            toast.error("Lỗi khi xử lý");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Khuyến Mãi & Voucher</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các chương trình giảm giá và mã Coupon</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Thêm Mã Giảm Giá
                </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm focus:outline-none">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã Code</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trị giá giảm</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bắt buộc (Đơn tối thiểu)</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái / Tồn kho</th>
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
                            ) : vouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Chưa có mã giảm giá nào.
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map((voucher) => (
                                    <tr key={voucher.id} className="hover:bg-blue-50/50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 font-mono text-sm font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                                    <Gift className="h-3 w-3" />
                                                    {voucher.maGiamGia}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-green-600">
                                                {voucher.loaiGiamGia === "PERCENT"
                                                    ? `${voucher.giaTriGiam}%`
                                                    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.giaTriGiam)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.donToiThieu)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {voucher.trangThai === 1 ? (
                                                    <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Khả dụng</span>
                                                ) : (
                                                    <span className="inline-flex w-fit items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Đã khóa/Hết hạn</span>
                                                )}
                                                <span className="text-xs text-gray-500 ml-1">Còn lại: {voucher.soLuongConLai} lượt</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openEditModal(voucher)}
                                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors mr-2 cursor-pointer" 
                                                title="Sửa"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(voucher.id)}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                                                title="Ẩn / Xóa"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto w-full h-full">
                    <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                            <h3 className="text-lg font-bold text-gray-900">
                                {modalMode === "add" ? "Thêm Mã Giảm Giá Mới" : "Sửa Mã Giảm Giá"}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={modalMode === "edit"}
                                    value={formData.maGiamGia}
                                    onChange={(e) => setFormData({ ...formData, maGiamGia: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase text-gray-900 disabled:bg-gray-100"
                                    placeholder="VD: SUMMER10..."
                                />
                                {modalMode === "edit" && <p className="text-xs text-gray-400 mt-1">Không thể thay đổi mã code sau khi tạo.</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loại giảm giá
                                    </label>
                                    <select
                                        value={formData.loaiGiamGia}
                                        onChange={(e) => setFormData({ ...formData, loaiGiamGia: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
                                    >
                                        <option value="PERCENT">Phần trăm (%)</option>
                                        <option value="FIXED">Giá trị tĩnh (VND)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Giá trị giảm <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.giaTriGiam}
                                            onChange={(e) => setFormData({ ...formData, giaTriGiam: Number(e.target.value) })}
                                            className="w-full px-4 py-2 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                            <span className="text-gray-500 text-sm font-medium">
                                                {formData.loaiGiamGia === "PERCENT" ? "%" : "₫"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đơn tối thiểu (VND)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.donToiThieu}
                                        onChange={(e) => setFormData({ ...formData, donToiThieu: Number(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số lượng mã
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.soLuongConLai}
                                        onChange={(e) => setFormData({ ...formData, soLuongConLai: Number(e.target.value) })}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày hết hạn
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.ngayHetHan}
                                    onChange={(e) => setFormData({ ...formData, ngayHetHan: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.trangThai}
                                    onChange={(e) => setFormData({ ...formData, trangThai: Number(e.target.value) })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900"
                                >
                                    <option value={1}>Khả dụng</option>
                                    <option value={0}>Đã khóa / Hết hạn</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
