"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { adminApi } from "@/lib/api";
import { Pencil, Trash2, Plus, X, EyeOff, Eye, Search, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterGender, setFilterGender] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [formData, setFormData] = useState({
        tenDanhMuc: "",
        moTa: "",
        trangThai: 1,
        gioiTinh: "NAM" as string,
        hinhAnh: "" as string,
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Hàm upload file lên Cloudinary ──
    const uploadToCloudinary = async (file: File): Promise<string | null> => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "product";
        if (!cloudName) { toast.error("Chưa cấu hình Cloudinary"); return null; }
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", uploadPreset);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: data });
            const json = await res.json();
            if (json.secure_url) return json.secure_url;
            toast.error("Upload thất bại"); return null;
        } catch { toast.error("Lỗi kết nối khi tải ảnh"); return null; }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const url = await uploadToCloudinary(file);
        setUploadingImage(false);
        if (url) {
            setFormData(prev => ({ ...prev, hinhAnh: url }));
            toast.success("Tải ảnh thành công");
        }
        e.target.value = "";
    };

    const openAddModal = () => {
        setModalMode("add");
        setFormData({ tenDanhMuc: "", moTa: "", trangThai: 1, gioiTinh: "NAM", hinhAnh: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (category: any) => {
        setModalMode("edit");
        setEditingCategory(category);
        setFormData({
            tenDanhMuc: category.tenDanhMuc || "",
            moTa: category.moTa || "",
            trangThai: category.trangThai ?? 1,
            gioiTinh: category.gioiTinh || "NAM",
            hinhAnh: category.hinhAnh || "",
        });
        setIsModalOpen(true);
    };

    const openViewModal = (category: any) => {
        setModalMode("view");
        setEditingCategory(category);
        setFormData({
            tenDanhMuc: category.tenDanhMuc || "",
            moTa: category.moTa || "",
            trangThai: category.trangThai ?? 1,
            gioiTinh: category.gioiTinh || "NAM",
            hinhAnh: category.hinhAnh || "",
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                ...formData
            };
            if (modalMode === "add") {
                await adminApi.createCategory(payload);
                toast.success("Thêm danh mục thành công");
            } else {
                await adminApi.updateCategory(editingCategory.id, payload);
                toast.success("Cập nhật danh mục thành công");
            }
            closeModal();
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Lỗi khi ${modalMode === "add" ? "thêm" : "cập nhật"} danh mục`);
        } finally {
            setSubmitting(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await adminApi.getCategories();
            // Server trả về DTO có 'soLuongSanPham' và 'hinhAnh' ở trong Object con hoặc Root Object
            setCategories(res.data);
        } catch (error) {
            toast.error("Không thể tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleToggleStatus = async (cat: any) => {
        const newStatus = cat.trangThai === 1 ? 0 : 1;
        const msg = newStatus === 1 ? "Hiện" : "Ẩn";
        if (!window.confirm(`Bạn có chắc chắn muốn ${msg} danh mục này?`)) return;
        try {
            await adminApi.updateCategory(cat.id, { ...cat, trangThai: newStatus });
            toast.success(`Đã ${msg} danh mục`);
            fetchCategories(); // Reload
        } catch (error) {
            toast.error(`Lỗi khi ${msg} danh mục`);
        }
    };

    const handleHardDelete = async (id: number) => {
        if (!window.confirm("CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN danh mục khỏi hệ thống.\nBạn có chắc chắn tiếp tục?")) return;
        try {
            await adminApi.deleteCategoryHard(id);
            toast.success("Đã xóa vĩnh viễn danh mục");
            fetchCategories(); // Reload
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa vĩnh viễn danh mục");
        }
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            const matchSearch = !search || 
                (cat.tenDanhMuc || "").toLowerCase().includes(search.toLowerCase()) || 
                (cat.moTa || "").toLowerCase().includes(search.toLowerCase());
            const matchGender = !filterGender || (cat.gioiTinh || "") === filterGender;
            return matchSearch && matchGender;
        });
    }, [categories, search, filterGender]);

    const isFiltering = search || filterGender;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh mục sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý các danh mục phân loại</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Thêm danh mục
                </button>
            </div>

            {/* Thanh tìm kiếm + Nút lọc */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {[
                        { value: "", label: "Tất cả" },
                        { value: "NAM", label: "Nam" },
                        { value: "NU", label: "Nữ" },
                        { value: "UNISEX", label: "Unisex" },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFilterGender(opt.value)}
                            className={`px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                                filterGender === opt.value
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm focus:outline-none">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">ID</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh Mục</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phân loại</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Số Sản Phẩm</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        {isFiltering ? `Không tìm thấy danh mục phù hợp.` : "Chưa có danh mục nào."}
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-blue-50/50">
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">#{cat.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                                                    {cat.hinhAnh ? (
                                                        <Image src={cat.hinhAnh} alt={cat.tenDanhMuc} fill className="object-cover" unoptimized />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Trống</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{cat.tenDanhMuc}</p>
                                                    <p className="text-xs text-gray-500 max-w-xs truncate" title={cat.moTa}>{cat.moTa || "Chưa có mô tả"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {cat.gioiTinh === "NAM" ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">Thời trang Nam</span>
                                            ) : cat.gioiTinh === "NU" ? (
                                                <span className="inline-flex items-center rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-600/20">Thời trang Nữ</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">Unisex</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-600">{cat.soLuongSanPham || 0} SP</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {cat.trangThai === 1 ? (
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Hoạt động</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Đã ẩn</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(cat)}
                                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors mr-2 cursor-pointer"
                                                title="Sửa"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openViewModal(cat)}
                                                className="text-gray-600 hover:bg-gray-50 p-2 rounded-lg transition-colors mr-2 cursor-pointer"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(cat)}
                                                className={`p-2 rounded-lg transition-colors mr-2 cursor-pointer ${cat.trangThai === 1 ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={cat.trangThai === 1 ? "Ẩn danh mục" : "Hiện danh mục"}
                                            >
                                                {cat.trangThai === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleHardDelete(cat.id)}
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {modalMode === "add" ? "Thêm danh mục mới" : modalMode === "edit" ? "Sửa danh mục" : "Chi tiết danh mục"}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.tenDanhMuc}
                                    onChange={(e) => setFormData({ ...formData, tenDanhMuc: e.target.value })}
                                    disabled={modalMode === "view"}
                                    className={`w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 ${modalMode === "view" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                                    placeholder="Nhập tên danh mục..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.moTa}
                                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                    disabled={modalMode === "view"}
                                    className={`w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-gray-900 ${modalMode === "view" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                                    placeholder="Mô tả danh mục..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phân loại <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.gioiTinh}
                                    onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                                    disabled={modalMode === "view"}
                                    className={`w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 ${modalMode === "view" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                                >
                                    <option value="NAM">Thời trang Nam</option>
                                    <option value="NU">Thời trang Nữ</option>
                                    <option value="UNISEX">Unisex</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái
                                </label>
                                <select
                                    value={formData.trangThai}
                                    onChange={(e) => setFormData({ ...formData, trangThai: Number(e.target.value) })}
                                    disabled={modalMode === "view"}
                                    className={`w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 ${modalMode === "view" ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                                >
                                    <option value={1}>Hoạt động</option>
                                    <option value={0}>Đã ẩn</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ảnh đại diện
                                </label>
                                <div className="flex items-start gap-4">
                                    {formData.hinhAnh ? (
                                        <div className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group shrink-0">
                                            <Image 
                                                src={formData.hinhAnh} 
                                                alt="Category Image" 
                                                fill 
                                                className="object-cover" 
                                                unoptimized
                                            />
                                            {modalMode !== "view" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, hinhAnh: "" }))}
                                                    className="absolute top-1 right-1 p-1 bg-white/90 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-gray-50">
                                            <Upload className="w-5 h-5 mb-1 text-gray-400" />
                                            <span className="text-[10px]">Trống</span>
                                        </div>
                                    )}
                                    
                                    {modalMode !== "view" && (
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingImage}
                                                className="px-4 py-2.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {uploadingImage ? (
                                                    <>
                                                        <div className="w-4 h-4 rounded-full border-2 border-blue-600/30 border-t-blue-600 animate-spin" />
                                                        Đang tải...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4" />
                                                        Tải ảnh lên
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-xs text-gray-500 mt-2">Đinh dạng thẻ JPG, PNG, WEBP. Tối đa 5MB.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all cursor-pointer"
                                >
                                    Hủy
                                </button>
                                {modalMode !== "view" && (
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        {submitting ? "Đang xử lý..." : modalMode === "add" ? "Thêm" : "Lưu thay đổi"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
