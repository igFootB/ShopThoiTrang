"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { adminApi } from "@/lib/api";
import { formatVND } from "@/lib/utils";
import { Plus, Search, Filter, Pencil, Trash2, Box, X, Upload, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

type Product = {
  id: number;
  tenSanPham: string;
  gia: number;
  moTa?: string;
  hinhAnh?: string;
  thumbnail?: string;
  danhMucId?: number;
  categoryId?: number;
  danhMuc?: any;
  trangThai?: number;
  listHinhAnh?: { id: number; duongDanAnh: string; isThumbnail: number }[];
};

type ProductForm = {
  tenSanPham: string;
  gia: string; // dùng string để người dùng nhập tự do
  moTa: string;
  danhMucId: number | "";
  hinhAnh: string[]; // mảng 5 phần tử (index 0 = ảnh chính, 1-4 = ảnh phụ)
  trangThai?: number;
};

// Mỗi biến thể là 1 entry riêng
type VariantEntry = {
  mauSac: string;
  size: string;
  soLuong: number;
  images: string[];  // Danh sách URL ảnh cho biến thể này
};

// Form nhập liệu cho 1 nhóm biến thể đang tạo (1 màu + nhiều size)
type VariantInputForm = {
  mauSac: string;
  sizes: string[];      // Danh sách size đã thêm
  sizeInput: string;    // ô nhập size hiện tại
  soLuong: number;
  images: string[];
};

const EMPTY_FORM: ProductForm = {
  tenSanPham: "",
  gia: "",
  moTa: "",
  danhMucId: "",
  hinhAnh: ["", "", "", "", ""],
  trangThai: 1,
};

const EMPTY_VARIANT_INPUT: VariantInputForm = {
  mauSac: "",
  sizes: [],
  sizeInput: "",
  soLuong: 1,
  images: [],
};

// ── Hàm upload file lên Cloudinary ──
async function uploadToCloudinary(file: File): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "product";
  if (!cloudName) { toast.error("Chưa cấu hình Cloudinary"); return null; }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.secure_url) return data.secure_url;
    toast.error("Upload thất bại"); return null;
  } catch { toast.error("Lỗi kết nối khi tải ảnh"); return null; }
}

// ── Format số tiền VND khi nhập ──
function formatPriceInput(value: string): string {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("vi-VN");
}

function parsePriceInput(formatted: string): number {
  return Number(formatted.replace(/\D/g, "")) || 0;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Biến thể: danh sách đã thêm + form nhập liệu hiện tại
  const [variantEntries, setVariantEntries] = useState<VariantEntry[]>([]);
  const [variantInput, setVariantInput] = useState<VariantInputForm>(EMPTY_VARIANT_INPUT);
  const variantFileRef = useRef<HTMLInputElement | null>(null);
  const [variantUploading, setVariantUploading] = useState(false);

  // Variant Modal (cho sản phẩm đã tồn tại)
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [variantForm, setVariantForm] = useState({ kichCo: "", mauSac: "", soLuong: 0 });

  // File input refs cho 5 ô ảnh
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Uploading state cho mỗi ô ảnh ──
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  // ── Preview: ảnh nào đang hiển thị ở vùng lớn ──
  const [previewIdx, setPreviewIdx] = useState<number>(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories()
      ]);
      setProducts(prodRes.data.content || prodRes.data || []);
      setCategories(catRes.data);
    } catch {
      toast.error("Không thể tải dữ liệu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search || (p.tenSanPham || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || String(p.danhMuc?.id) === filterCategory;
    const matchStatus = filterStatus === "" || String(p.trangThai) === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  // ── Mở modal Thêm mới ──
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsViewMode(false);
    setVariantEntries([]);
    setVariantInput(EMPTY_VARIANT_INPUT);
    setPreviewIdx(0);
    setModalOpen(true);
  };

  // ── Hàm lấy mảng ảnh từ product data ──
  const getImageUrls = (product: Product): string[] => {
    const result = ["", "", "", "", ""];
    let urls: string[] = [];
    if (Array.isArray(product.listHinhAnh) && product.listHinhAnh.length > 0) {
      urls = product.listHinhAnh.map(img => img.duongDanAnh);
    } else if (Array.isArray(product.hinhAnh) && product.hinhAnh.length > 0) {
      urls = product.hinhAnh as any;
    } else if (typeof product.hinhAnh === "string" && product.hinhAnh.trim() !== "") {
      urls = [product.hinhAnh];
    } else if (typeof product.thumbnail === "string" && product.thumbnail.trim() !== "") {
      urls = [product.thumbnail];
    }
    urls.forEach((u, i) => { if (i < 5) result[i] = u; });
    return result;
  };

  const openEdit = (product: Product) => {
    setForm({
      tenSanPham: product.tenSanPham,
      gia: formatPriceInput(String(product.gia)),
      moTa: product.moTa || "",
      danhMucId: product.categoryId || product.danhMucId || product.danhMuc?.id || "",
      hinhAnh: getImageUrls(product),
      trangThai: product.trangThai ?? 1,
    });
    setEditingId(product.id);
    setIsViewMode(false);
    setPreviewIdx(0);
    setModalOpen(true);
  };

  const openView = (product: Product) => {
    setForm({
      tenSanPham: product.tenSanPham,
      gia: formatPriceInput(String(product.gia)),
      moTa: product.moTa || "",
      danhMucId: product.categoryId || product.danhMucId || product.danhMuc?.id || "",
      hinhAnh: getImageUrls(product),
      trangThai: product.trangThai ?? 1,
    });
    setEditingId(product.id);
    setIsViewMode(true);
    setPreviewIdx(0);
    setModalOpen(true);
  };

  // ── Xử lý chọn file ảnh từ ổ đĩa ──
  const handleFileSelect = async (slotIndex: number, file: File) => {
    setUploadingIdx(slotIndex);
    const url = await uploadToCloudinary(file);
    setUploadingIdx(null);
    if (url) {
      setForm(prev => {
        const newArr = [...prev.hinhAnh];
        newArr[slotIndex] = url;
        return { ...prev, hinhAnh: newArr };
      });
      toast.success(`Tải ảnh lên thành công`);
    }
  };

  const handleRemoveImage = (slotIndex: number) => {
    setForm(prev => {
      const newArr = [...prev.hinhAnh];
      newArr[slotIndex] = "";
      return { ...prev, hinhAnh: newArr };
    });
  };

  // ── Toggle trạng thái ──
  const handleToggleStatus = async (product: Product) => {
    try {
      const isHidden = product.trangThai === 0;
      if (!isHidden) {
        if (!window.confirm("Bạn có chắc chắn muốn ẩn sản phẩm này?")) return;
        await adminApi.deleteProduct(product.id);
        toast.success("Đã ẩn sản phẩm");
      } else {
        const payload = {
          tenSanPham: product.tenSanPham,
          gia: product.gia,
          moTa: product.moTa || "",
          danhMucId: product.categoryId || product.danhMucId || product.danhMuc?.id || "",
          hinhAnh: product.listHinhAnh?.map(i => i.duongDanAnh) || (product.thumbnail ? [product.thumbnail] : []),
          trangThai: 1
        };
        await adminApi.updateProduct(product.id, payload);
        toast.success("Sản phẩm đã hiển thị lại");
      }
      fetchData();
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleHardDelete = async (id: number) => {
    if (!window.confirm("CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN sản phẩm.\nBạn có chắc chắn?")) return;
    try {
      await adminApi.deleteProductHard(id);
      toast.success("Xóa vĩnh viễn thành công");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  // ── Lưu sản phẩm ──
  const handleSave = async () => {
    try {
      const price = parsePriceInput(form.gia);
      if (!form.tenSanPham || !price || !form.danhMucId) {
        toast.error("Vui lòng điền đủ: Tên, Giá, Danh mục");
        return;
      }

      // Tạo danh sách biến thể + ảnh theo màu từ variantEntries
      let variants: { size: string; mauSac: string; soLuong: number }[] = [];
      const colorImagesMap: Record<string, string[]> = {};
      if (!editingId && variantEntries.length > 0) {
        for (const entry of variantEntries) {
          variants.push({ mauSac: entry.mauSac, size: entry.size, soLuong: entry.soLuong });
          // Gom ảnh theo màu
          if (entry.images.length > 0) {
            if (!colorImagesMap[entry.mauSac]) colorImagesMap[entry.mauSac] = [];
            for (const url of entry.images) {
              if (!colorImagesMap[entry.mauSac].includes(url)) {
                colorImagesMap[entry.mauSac].push(url);
              }
            }
          }
        }
      }

      const payload: any = {
        tenSanPham: form.tenSanPham,
        gia: price,
        moTa: form.moTa,
        danhMucId: form.danhMucId,
        trangThai: form.trangThai,
        hinhAnh: form.hinhAnh.filter(Boolean),
        variants: variants.length > 0 ? variants : undefined,
      };

      // Gửi ảnh theo màu
      const ciArr = Object.entries(colorImagesMap)
        .filter(([, urls]) => urls.length > 0)
        .map(([mauSac, urls]) => ({ mauSac, urls }));
      if (ciArr.length > 0) payload.colorImages = ciArr;

      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        toast.success("Cập nhật thành công");
      } else {
        await adminApi.createProduct(payload);
        toast.success("Thêm mới thành công");
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error("Lỗi khi lưu sản phẩm");
    }
  };

  // ── Variant modal functions (cho sản phẩm đã tồn tại) ──
  const openVariants = async (product: Product) => {
    setCurrentProduct(product);
    setVariantModalOpen(true);
    fetchVariants(product.id);
  };

  const fetchVariants = async (productId: number) => {
    try { const res = await adminApi.getProductVariants(productId); setVariants(res.data); } catch { toast.error("Lỗi tải kho"); }
  };

  const handleAddVariant = async () => {
    if (!currentProduct) return;
    if (!variantForm.kichCo || !variantForm.mauSac || variantForm.soLuong <= 0) {
      toast.error("Vui lòng nhập Kích cỡ, Màu sắc và Số lượng");
      return;
    }
    try {
      await adminApi.addProductVariant(currentProduct.id, variantForm);
      toast.success("Thêm biến thể thành công");
      setVariantForm({ kichCo: "", mauSac: "", soLuong: 0 });
      fetchVariants(currentProduct.id);
    } catch { toast.error("Lỗi thêm biến thể"); }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!window.confirm("Xóa biến thể này?")) return;
    try {
      if (!currentProduct) return;
      await adminApi.deleteProductVariant(currentProduct.id, variantId);
      toast.success("Đã xóa");
      fetchVariants(currentProduct.id);
    } catch { toast.error("Lỗi khi xóa"); }
  };

  // ── Thêm biến thể vào danh sách (1 màu × nhiều size) ──
  const handleAddVariantEntry = () => {
    const { mauSac, sizes, soLuong } = variantInput;
    if (!mauSac.trim()) { toast.error("Vui lòng nhập màu sắc"); return; }
    if (sizes.length === 0) { toast.error("Vui lòng thêm ít nhất 1 size"); return; }
    if (soLuong <= 0) { toast.error("Số lượng phải > 0"); return; }
    // Kiểm tra trùng
    const dupes = sizes.filter(s => variantEntries.find(e => e.mauSac === mauSac.trim() && e.size === s));
    if (dupes.length > 0) { toast.error(`Biến thể ${mauSac}/${dupes.join(", ")} đã tồn tại`); return; }
    const newEntries: VariantEntry[] = sizes.map(size => ({
      mauSac: mauSac.trim(),
      size,
      soLuong,
      images: [...variantInput.images]
    }));
    setVariantEntries(prev => [...prev, ...newEntries]);
    setVariantInput(EMPTY_VARIANT_INPUT);
    toast.success(`Đã thêm ${sizes.length} biến thể cho màu ${mauSac}`);
  };

  // Thêm/xóa size tag trong ô nhập
  const addSizeToInput = () => {
    const v = variantInput.sizeInput.trim();
    if (!v) return;
    if (variantInput.sizes.includes(v)) { toast.error("Size đã có"); return; }
    setVariantInput(prev => ({ ...prev, sizes: [...prev.sizes, v], sizeInput: "" }));
  };

  const removeSizeFromInput = (size: string) => {
    setVariantInput(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
  };

  const handleRemoveVariantEntry = (index: number) => {
    setVariantEntries(prev => prev.filter((_, i) => i !== index));
  };

  // Upload ảnh cho biến thể đang nhập
  const handleVariantImageUpload = async (file: File) => {
    setVariantUploading(true);
    const url = await uploadToCloudinary(file);
    setVariantUploading(false);
    if (url) {
      setVariantInput(prev => ({ ...prev, images: [...prev.images, url] }));
      toast.success("Đã tải ảnh");
    }
  };

  const handleRemoveVariantImage = (imgIndex: number) => {
    setVariantInput(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== imgIndex) }));
  };

  // ── Lấy ảnh đại diện trên bảng danh sách ──
  const getProductThumb = (product: Product): string | null => {
    if (product.thumbnail) return product.thumbnail;
    if (Array.isArray(product.listHinhAnh) && product.listHinhAnh.length > 0) return product.listHinhAnh[0].duongDanAnh;
    if (Array.isArray(product.hinhAnh) && product.hinhAnh.length > 0) return (product.hinhAnh as any)[0];
    if (typeof product.hinhAnh === "string" && product.hinhAnh) return product.hinhAnh;
    return null;
  };

  // ── Ảnh đang preview (lấy từ previewIdx, fallback về ảnh chính) ──
  const previewUrl = form.hinhAnh[previewIdx] || form.hinhAnh.find(Boolean) || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý kho hàng và thông tin sản phẩm</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Card Wrapper */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên sản phẩm..."
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2 flex-wrap">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.tenDanhMuc}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hiển thị</option>
              <option value="0">Đã ẩn</option>
            </select>
            {(filterCategory || filterStatus) && (
              <button
                onClick={() => { setFilterCategory(""); setFilterStatus(""); }}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-200"
              >
                <X className="w-4 h-4" /> Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 p-6">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-16 w-full animate-pulse rounded-lg bg-gray-100" />))}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"><Search className="h-8 w-8 text-gray-400" /></div>
              <h3 className="text-sm font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
              <p className="mt-1 text-sm text-gray-500">Hãy thử nhập từ khóa khác.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Hành động</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((product) => {
                  const thumb = getProductThumb(product);
                  return (
                    <tr key={product.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                            {thumb ? (
                              <Image src={thumb} alt="" fill unoptimized className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400"><Box className="h-5 w-5" /></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 line-clamp-2 max-w-[200px]" title={product.tenSanPham}>{product.tenSanPham}</div>
                            <div className="text-xs text-gray-500 mt-0.5">ID: #{product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-blue-600">{formatVND(product.gia)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{product.danhMuc?.tenDanhMuc ?? "—"}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {product.trangThai === 0 ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Đã ẩn</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Hiển thị</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openVariants(product)} className="text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition-colors" title="Quản lý Kho"><Box className="h-4 w-4" /></button>
                          <button onClick={() => openView(product)} className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors" title="Xem chi tiết"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => openEdit(product)} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Chỉnh sửa"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleToggleStatus(product)} className={`${product.trangThai === 0 ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-orange-600 bg-orange-50 hover:bg-orange-100'} p-2 rounded-lg transition-colors flex items-center gap-1`} title={product.trangThai === 0 ? "Hiện" : "Ẩn"}>
                            {product.trangThai === 0 ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            <span className="text-xs hidden lg:inline">{product.trangThai === 0 ? "Hiện" : "Ẩn"}</span>
                          </button>
                          <button onClick={() => handleHardDelete(product.id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Xóa vĩnh viễn"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between rounded-b-2xl">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-900">1</span> đến <span className="font-medium text-gray-900">{filtered.length}</span> trong số <span className="font-medium text-gray-900">{filtered.length}</span> kết quả
            </div>
            <div className="flex gap-1">
              <button disabled className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-400 opacity-50 cursor-not-allowed">Trước</button>
              <button className="rounded-lg border border-blue-600 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">1</button>
              <button disabled className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-400 opacity-50 cursor-not-allowed">Sau</button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ Modal Thêm / Sửa / Xem Sản Phẩm ══════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto w-full h-full">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                {isViewMode ? "Chi tiết sản phẩm" : editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 space-y-5">
              {/* Tên sản phẩm */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tên sản phẩm *</label>
                <input type="text" value={form.tenSanPham}
                  onChange={(e) => setForm(f => ({ ...f, tenSanPham: e.target.value }))}
                  disabled={isViewMode} placeholder="Nhập tên sản phẩm..."
                  className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
              </div>

              {/* Giá - Textbox thuần, không mũi tên */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Giá (VND) *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.gia}
                    onChange={(e) => setForm(f => ({ ...f, gia: formatPriceInput(e.target.value) }))}
                    disabled={isViewMode}
                    placeholder="Nhập giá sản phẩm..."
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">₫</span>
                  </div>
                </div>
              </div>

              {/* Trạng thái & Danh mục */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select value={form.trangThai ?? 1} onChange={(e) => setForm(f => ({ ...f, trangThai: Number(e.target.value) }))}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
                    <option value={1}>Đang hiển thị</option>
                    <option value={0}>Đã ẩn (Ngừng bán)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Danh mục *</label>
                  <select value={form.danhMucId} onChange={(e) => setForm(f => ({ ...f, danhMucId: Number(e.target.value) }))}
                    disabled={isViewMode}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.tenDanhMuc}</option>))}
                  </select>
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                <textarea value={form.moTa} onChange={(e) => setForm(f => ({ ...f, moTa: e.target.value }))}
                  disabled={isViewMode} rows={3} placeholder="Nhập mô tả sản phẩm..."
                  className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
              </div>

              {/* ── Hình ảnh đại diện sản phẩm (Chỉ 1 ảnh chính) ── */}
              <div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Hình ảnh đại diện sản phẩm</label>
                  <p className="text-xs text-gray-500 mt-0.5">Đây là ảnh chính hiển thị trên thẻ sản phẩm ở ngoài trang chủ.</p>
                </div>

                {/* ── Vùng xem trước (Preview) ── */}
                <div className="relative w-full aspect-[16/9] rounded-xl border-2 border-gray-200 bg-gray-50 overflow-hidden mb-3">
                  {form.hinhAnh[0] ? (
                    <>
                      <Image src={form.hinhAnh[0]} alt="Xem trước" fill unoptimized className="object-contain" />
                      {!isViewMode && (
                        <button type="button" onClick={() => handleRemoveImage(0)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : uploadingIdx === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full h-full text-blue-500">
                      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-xs">Đang tải lên...</span>
                    </div>
                  ) : !isViewMode ? (
                    <button type="button" onClick={() => fileInputRefs.current[0]?.click()}
                      className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-blue-500 transition-colors">
                      <Upload className="h-8 w-8 mb-2" />
                      <span className="text-sm font-medium">Nhấn để tải ảnh đại diện</span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-300">
                      <Upload className="h-8 w-8" />
                      <span className="text-xs mt-1">Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                {/* ── Nút Load Ảnh File Input (Ẩn) ── */}
                <input ref={el => { fileInputRefs.current[0] = el; }} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(0, file); e.target.value = ""; }} />
              </div>



              {/* ── Biến thể (chỉ khi Thêm mới) ── */}
              {!editingId && !isViewMode && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                  <label className="block text-sm font-bold text-gray-800">Phân loại hàng</label>
                  <p className="text-xs text-gray-500 -mt-2">Nhập thông tin biến thể rồi nhấn "Thêm biến thể" để lưu vào danh sách.</p>

                  {/* ── Form nhập 1 biến thể ── */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Màu sắc *</label>
                        <input type="text" value={variantInput.mauSac}
                          onChange={(e) => setVariantInput(prev => ({ ...prev, mauSac: e.target.value }))}
                          placeholder="VD: Đen"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Kích cỡ * <span className="text-gray-400 font-normal">(nhấn Enter để thêm)</span></label>
                        <div className="flex gap-2">
                          <input type="text" value={variantInput.sizeInput}
                            onChange={(e) => setVariantInput(prev => ({ ...prev, sizeInput: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSizeToInput(); } }}
                            placeholder="VD: S, M, L..."
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        {(variantInput.sizes?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(variantInput.sizes || []).map(s => (
                              <span key={s} className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                {s}
                                <button type="button" onClick={() => removeSizeFromInput(s)} className="text-green-500 hover:text-red-500"><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Số lượng *</label>
                        <input type="text" value={variantInput.soLuong}
                          onChange={(e) => setVariantInput(prev => ({ ...prev, soLuong: Number(e.target.value.replace(/\D/g, "")) || 0 }))}
                          placeholder="1"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Ảnh cho biến thể này */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">📸 Ảnh (cho màu này)</label>
                      <p className="text-[10px] text-gray-500 mb-2">1 ảnh chính (Lớn) và tối đa 4 ảnh phụ (chọn nhiều).</p>

                      <div className="flex gap-2 flex-wrap">
                        {/* ── Ô Ảnh Chính (index 0) ── */}
                        <div className="relative">
                          <div
                            className={`aspect-square w-16 h-16 rounded-md border-2 overflow-hidden cursor-pointer transition-all group relative
                              ${variantInput.images[0] ? 'border-gray-200 bg-white' : 'border-dashed border-gray-300 bg-gray-50 hover:border-blue-400'}`}
                            onClick={() => !variantInput.images[0] && variantFileRef.current?.click()}
                          >
                            {variantInput.images[0] ? (
                              <>
                                <Image src={variantInput.images[0]} alt="Ảnh chính biến thể" fill unoptimized className="object-cover" />
                                <button type="button" onClick={(e) => {
                                  e.stopPropagation();
                                  setVariantInput(p => { const arr = [...p.images]; arr[0] = ""; return { ...p, images: arr }; });
                                }}
                                  className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </>
                            ) : variantUploading ? (
                              <div className="flex items-center justify-center w-full h-full text-blue-500">
                                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-blue-500">
                                <Plus className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="text-center mt-1 text-[9px] font-bold text-blue-600">CHÍNH</div>
                          <input ref={variantFileRef} type="file" accept="image/*" className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setVariantUploading(true);
                                const url = await uploadToCloudinary(f);
                                setVariantUploading(false);
                                if (url) setVariantInput(p => { const arr = [...p.images]; arr[0] = url; return { ...p, images: arr }; });
                              }
                              e.target.value = "";
                            }}
                          />
                        </div>

                        {/* ── Các Ô Ảnh Phụ (index 1-4) ── */}
                        {[1, 2, 3, 4].filter(idx => variantInput.images[idx]).map(idx => (
                          <div key={idx} className="relative group/sub">
                            <div className="aspect-square w-16 h-16 rounded-md border border-gray-200 overflow-hidden relative bg-white">
                              <Image src={variantInput.images[idx]} alt={`Phụ ${idx}`} fill unoptimized className="object-cover" />
                              <button type="button" onClick={() => {
                                setVariantInput(p => { const arr = [...p.images]; arr[idx] = ""; return { ...p, images: arr }; });
                              }}
                                className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            <div className="text-center mt-1 text-[9px] font-medium text-gray-500">Phụ</div>
                          </div>
                        ))}

                        {/* ── Nút Thêm Nhiều Ảnh Phụ ── */}
                        {variantInput.images.filter(Boolean).length < 5 && (
                          <div className="relative">
                            <button type="button" onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.multiple = true;
                              input.accept = 'image/*';
                              input.onchange = async (e: any) => {
                                const files = Array.from(e.target.files || []) as File[];
                                if (files.length > 0) {
                                  setVariantUploading(true);
                                  for (const f of files) {
                                    const url = await uploadToCloudinary(f);
                                    if (url) {
                                      setVariantInput(p => {
                                        const arr = [...p.images];
                                        // Tìm slot trống từ 1-4
                                        let slot = 1;
                                        while (slot < 5 && arr[slot]) slot++;
                                        if (slot < 5) arr[slot] = url;
                                        return { ...p, images: arr };
                                      });
                                    }
                                  }
                                  setVariantUploading(false);
                                }
                              };
                              input.click();
                            }}
                              className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-colors bg-gray-50">
                              {variantUploading ? (
                                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </button>
                            <div className="text-center mt-1 text-[9px] font-medium text-gray-500">Phụ</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button type="button" onClick={handleAddVariantEntry}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      <Plus className="h-4 w-4" /> Thêm biến thể
                    </button>
                  </div>

                  {/* ── Danh sách biến thể đã thêm ── */}
                  {variantEntries.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-2">Đã thêm {variantEntries.length} biến thể:</h4>
                      <div className="space-y-2">
                        {variantEntries.map((entry, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                            {/* Ảnh thumbnail */}
                            <div className="flex gap-1 flex-shrink-0">
                              {entry.images.length > 0 && entry.images[0] ? (
                                <div className="relative w-10 h-10 rounded border-2 border-blue-400 overflow-hidden" title="Ảnh chính">
                                  <Image src={entry.images[0]} alt="Chính" fill unoptimized className="object-cover" />
                                  <div className="absolute top-0 left-0 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-br">CHÍNH</div>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-[8px] text-center" title="Chưa có ảnh chính">Trống</div>
                              )}

                              {/* Rút gọn hiển thị ảnh phụ */}
                              {entry.images.filter((_, i) => i > 0 && entry.images[i]).length > 0 && (
                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-medium">
                                  +{entry.images.filter((_, i) => i > 0 && entry.images[i]).length} phụ
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">{entry.mauSac}</span>
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">{entry.size}</span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">SL: {entry.soLuong} • Tổng {entry.images.filter(Boolean).length} ảnh</p>
                            </div>
                            {/* Xóa */}
                            <button type="button" onClick={() => handleRemoveVariantEntry(idx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-xs text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      Chưa có biến thể nào. Nhập thông tin bên trên rồi nhấn "Thêm biến thể".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl">
              <button onClick={() => setModalOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                {isViewMode ? "Đóng" : "Hủy bỏ"}
              </button>
              {!isViewMode && (
                <button onClick={handleSave}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                  {editingId ? "Lưu thay đổi" : "Thêm"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Modal Quản lý Biến thể (cho SP đã tồn tại) ══════════ */}
      {variantModalOpen && currentProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 w-full h-full">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Quản lý Kho (Biến thể)</h2>
                <p className="text-sm text-gray-500">{currentProduct.tenSanPham}</p>
              </div>
              <button onClick={() => setVariantModalOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Thêm phân loại mới</h3>
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[120px]">
                    <label className="mb-1 block text-xs font-medium text-gray-700">Kích cỡ</label>
                    <input type="text" placeholder="S, M, L..." value={variantForm.kichCo}
                      onChange={(e) => setVariantForm(f => ({ ...f, kichCo: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="mb-1 block text-xs font-medium text-gray-700">Màu sắc</label>
                    <input type="text" placeholder="Đen, Trắng..." value={variantForm.mauSac}
                      onChange={(e) => setVariantForm(f => ({ ...f, mauSac: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-xs font-medium text-gray-700">Số lượng</label>
                    <input type="text" value={variantForm.soLuong}
                      onChange={(e) => setVariantForm(f => ({ ...f, soLuong: Number(e.target.value.replace(/\D/g, "")) || 0 }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm" />
                  </div>
                  <button onClick={handleAddVariant}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Thêm
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tồn kho hiện tại</h3>
                <table className="min-w-full divide-y divide-gray-200 text-sm border rounded-lg overflow-hidden border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600">ID</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600">Kích Cỡ</th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600">Màu Sắc</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-600">Số Lượng</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-600">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {variants.length === 0 ? (
                      <tr><td colSpan={5} className="py-4 text-center text-gray-500">Chưa có phân loại nào.</td></tr>
                    ) : variants.map(v => (
                      <tr key={v.id}>
                        <td className="px-4 py-2.5 font-medium text-gray-900">#{v.id}</td>
                        <td className="px-4 py-2.5">{v.kichCo}</td>
                        <td className="px-4 py-2.5"><span className="inline-flex items-center rounded-sm bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">{v.mauSac}</span></td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{v.soLuong}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => handleDeleteVariant(v.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex justify-end">
              <button onClick={() => setVariantModalOpen(false)} className="px-5 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
