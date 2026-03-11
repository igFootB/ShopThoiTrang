"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Search, X, Eye, EyeOff, Upload } from "lucide-react";
import Image from "next/image";
import { adminApi, api } from "@/lib/api";
import { toast } from "react-hot-toast";

type Banner = {
  id: number;
  tieuDe: string;
  moTa: string;
  hinhAnh: string;
  duongDan: string;
  trangThai: number;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tieuDe: "",
    moTa: "",
    hinhAnh: "",
    duongDan: "",
    trangThai: 1,
  });

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const limit = 1000;
      const response = await adminApi.getBanners({ page: 0, limit });
      if (response.data && response.data.content) {
          setBanners(response.data.content);
          setTotalPages(response.data.totalPages || 1);
          setTotalElements(response.data.totalElements || 0);
      } else {
          setBanners([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách banner:", error);
      toast.error("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ------------------ CLOUDINARY UPLOAD ------------------ */
  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Chưa cấu hình Cloudinary");
      return null;
    }

    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", uploadPreset);

    try {
      setUploadingImage(true);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formDataCloud,
      });
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Lỗi upload");
      }
    } catch (error) {
      console.error("Lỗi upload Cloudinary:", error);
      toast.error("Không thể tải ảnh lên");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    const imageUrl = await uploadToCloudinary(file);
    if (imageUrl) {
      setFormData(prev => ({ ...prev, hinhAnh: imageUrl }));
    }
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  /* -------------------------------------------------------- */

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const newStatus = banner.trangThai === 1 ? 0 : 1;
      await adminApi.updateBanner(banner.id, { ...banner, trangThai: newStatus });
      toast.success(`Đã ${newStatus === 1 ? "hiện" : "ẩn"} banner`);
      fetchBanners();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleHardDelete = async (id: number) => {
    if (confirm("Lưu ý: Hành động này sẽ xóa vĩnh viễn banner khỏi CSDL. Bạn có chắc chắn muốn xóa?")) {
      try {
        await adminApi.deleteBanner(id);
        toast.success("Đã xóa vĩnh viễn banner");
        fetchBanners();
      } catch (error) {
        toast.error("Không thể xóa banner này");
      }
    }
  };

  /* Modal Handlers */
  const openAddModal = () => {
    setModalMode("add");
    setFormData({ tieuDe: "", moTa: "", hinhAnh: "", duongDan: "", trangThai: 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setModalMode("edit");
    setSelectedBanner(banner);
    setFormData({
      tieuDe: banner.tieuDe || "",
      moTa: banner.moTa || "",
      hinhAnh: banner.hinhAnh || "",
      duongDan: banner.duongDan || "",
      trangThai: banner.trangThai,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hinhAnh) {
        toast.error("Hình ảnh banner là bắt buộc");
        return;
    }

    try {
      if (modalMode === "add") {
        await adminApi.createBanner(formData);
        toast.success("Thêm banner mới thành công");
      } else if (modalMode === "edit" && selectedBanner) {
        await adminApi.updateBanner(selectedBanner.id, formData);
        toast.success("Cập nhật banner thành công");
      }
      closeModal();
      fetchBanners();
    } catch (error) {
      console.error(error);
      toast.error(`Có lỗi xảy ra khi ${modalMode === "add" ? "thêm" : "cập nhật"} banner`);
    }
  };

  const filteredBanners = banners.filter(banner =>
    (banner.tieuDe?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Banner trang chủ</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các banner lớn hiển thị trên Slide trang chủ</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Thêm banner
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề & Link</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right rounded-tr-2xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Không tìm thấy banner nào.
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">#{banner.id}</td>
                    <td className="py-4 px-6">
                      <div className="relative w-32 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        {banner.hinhAnh ? (
                          <Image src={banner.hinhAnh} alt={banner.tieuDe || "Banner"} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">Không có ảnh</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{banner.tieuDe || "Không có tiêu đề"}</span>
                        <span className="text-xs font-medium text-gray-400 mt-0.5 truncate max-w-[200px]">{banner.duongDan || "Không URL liên kết"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${banner.trangThai === 1
                          ? "bg-green-50 text-green-700 border-green-200/50"
                          : "bg-orange-50 text-orange-700 border-orange-200/50"
                          }`}
                      >
                        {banner.trangThai === 1 ? "Hoạt động" : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa banner"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(banner)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${banner.trangThai === 1 ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={banner.trangThai === 1 ? "Ẩn banner" : "Hiện banner"}
                        >
                          {banner.trangThai === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleHardDelete(banner.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === "add" ? "Thêm banner mới" : "Sửa banner"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh Banner <span className="text-red-500">*</span>
                </label>
                <div className="flex items-start gap-4">
                    {formData.hinhAnh ? (
                        <div className="relative w-48 h-24 rounded-xl border border-gray-200 overflow-hidden group shrink-0">
                            <Image 
                                src={formData.hinhAnh} 
                                alt="Banner Image" 
                                fill 
                                className="object-cover" 
                                unoptimized
                            />
                            {modalMode !== "view" && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, hinhAnh: "" }))}
                                    className="absolute top-1 right-1 p-1 bg-white/90 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white cursor-pointer shadow-sm"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="w-48 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 shrink-0 bg-gray-50">
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
                                className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">Định dạng JPG, PNG, WEBP. <br/>Kích thước khuyên dùng: 1920x800px</p>
                        </div>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề Banner
                </label>
                <input
                  type="text"
                  value={formData.tieuDe}
                  onChange={(e) => setFormData({ ...formData, tieuDe: e.target.value })}
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white"
                  placeholder="Nhập tiêu đề..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả / Slogan phụ
                </label>
                <input
                  type="text"
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white"
                  placeholder="Nhập mô tả..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đường dẫn (URL) khi click
                </label>
                <input
                  type="text"
                  value={formData.duongDan}
                  onChange={(e) => setFormData({ ...formData, duongDan: e.target.value })}
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white"
                  placeholder="VD: /category/nam hoặc https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái hiển thị
                </label>
                <select
                  value={formData.trangThai}
                  onChange={(e) => setFormData({ ...formData, trangThai: Number(e.target.value) })}
                  disabled={modalMode === "view"}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white"
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Đã ẩn</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalMode === "add" ? "Thêm mới" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
