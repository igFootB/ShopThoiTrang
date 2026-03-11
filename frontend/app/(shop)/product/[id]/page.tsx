"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { api, publicApi } from "@/lib/api";
import { formatVND } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { Heart, ShoppingCart, Truck, RotateCcw, Shield, ChevronRight, Minus, Plus, Check, Zap } from "lucide-react";

type ImageItem = {
  id: number;
  duongDanAnh: string;
  isThumbnail: number;
  mauSac?: string | null;
};

type VariantItem = {
  id: number;
  size: string;
  mauSac: string;
  soLuong: number;
};

type ProductDetail = {
  id: number;
  tenSanPham: string;
  moTa: string;
  gia: number;
  images: ImageItem[];
  variants: VariantItem[];
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { increaseCartCount, refreshCartCount } = useCart();
  const productId = Number(params.id);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await publicApi.get<ProductDetail>(`/products/${productId}`);
        setProduct(response.data);
      } catch {
        setError("Không tìm thấy sản phẩm hoặc đã xảy ra lỗi.");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(productId)) {
      fetchProductDetail();
    }
  }, [productId]);

  const sizeOptions = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map((variant) => variant.size)));
  }, [product]);

  const colorOptions = useMemo(() => {
    if (!product) return [];
    const filtered = selectedSize
      ? product.variants.filter((variant) => variant.size === selectedSize)
      : product.variants;
    return Array.from(new Set(filtered.map((variant) => variant.mauSac)));
  }, [product, selectedSize]);

  const selectedVariant = useMemo(() => {
    if (!product || !selectedSize || !selectedColor) return null;
    return (
      product.variants.find(
        (variant) => variant.size === selectedSize && variant.mauSac === selectedColor,
      ) ?? null
    );
  }, [product, selectedSize, selectedColor]);

  const allImages = useMemo(() => {
    if (!product?.images?.length) return [{ id: 0, duongDanAnh: "https://placehold.co/900x1200/1a1a1a/666666?text=No+Image", isThumbnail: 1, mauSac: null }];

    let result: typeof product.images = [];

    // Nếu đã chọn màu, lọc ảnh theo màu đó
    if (selectedColor) {
      const colorFiltered = product.images.filter(img => img.mauSac === selectedColor);
      if (colorFiltered.length > 0) {
        result = colorFiltered;
      }
    }

    // Nếu chưa có kết quả, lấy ảnh mặc định (không gắn màu) hoặc toàn bộ
    if (result.length === 0) {
      const defaultImages = product.images.filter(img => !img.mauSac);
      result = defaultImages.length > 0 ? defaultImages : product.images;
    }

    // Loại bỏ ảnh trùng URL
    const seen = new Set<string>();
    return result.filter(img => {
      if (seen.has(img.duongDanAnh)) return false;
      seen.add(img.duongDanAnh);
      return true;
    });
  }, [product, selectedColor]);

  const canAddToCart =
    Boolean(selectedSize) &&
    Boolean(selectedColor) &&
    Boolean(selectedVariant) &&
    (selectedVariant?.soLuong ?? 0) > 0 &&
    !adding;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      setAdding(true);
      await api.post("/cart/add", { variantId: selectedVariant.id, soLuong: quantity });
      increaseCartCount(quantity);
      await refreshCartCount();
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch {
      setError("Thêm vào giỏ hàng thất bại.");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    
    // Lưu thông tin mua ngay vào session storage
    const buyNowData = {
      productId: product?.id,
      tenSanPham: product?.tenSanPham,
      hinhAnh: allImages[0]?.duongDanAnh || "", // Lấy ảnh đầu tiên đang chọn
      gia: product?.gia || 0,
      variantId: selectedVariant.id,
      size: selectedVariant.size,
      mauSac: selectedVariant.mauSac,
      soLuong: quantity
    };
    
    sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowData));
    
    // Chuyển hướng tới trang checkout
    window.location.href = "/checkout";
  };

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <div className="bg-[#111] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 w-48 bg-white/5 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-white/5 rounded-xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-48 bg-white/5 rounded animate-pulse" />
              <div className="h-20 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error / Not Found ── */
  if (!product || error) {
    return (
      <div className="bg-[#111] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-4">{error ?? "Không tìm thấy sản phẩm"}</h1>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#b91c1c] hover:text-red-400 uppercase tracking-widest transition-colors">
            Quay lại trang chủ <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <ChevronRight size={10} />
          <span className="text-gray-300">{product.tenSanPham}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">

          {/* ══════════════════════════════════════════
               BÊN TRÁI: Ảnh sản phẩm
             ══════════════════════════════════════════ */}
          <div className="flex gap-4">
            {/* Thumbnail list (bên trái) */}
            {allImages.length > 1 && (
              <div className="hidden sm:flex flex-col gap-3 w-20 flex-shrink-0">
                {allImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative aspect-[3/4] rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === i ? "border-[#b91c1c]" : "border-transparent hover:border-white/20"
                      }`}
                  >
                    <Image
                      src={img.duongDanAnh}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Ảnh chính */}
            <div className="flex-1 relative aspect-[3/4] bg-[#1a1a1a] rounded-xl overflow-hidden">
              <Image
                src={allImages[selectedImageIndex]?.duongDanAnh ?? ""}
                alt={product.tenSanPham}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════
               BÊN PHẢI: Thông tin sản phẩm
             ══════════════════════════════════════════ */}
          <div className="flex flex-col">

            {/* Tên sản phẩm */}
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.1em] leading-relaxed mb-4">
              {product.tenSanPham}
            </h1>

            {/* Giá */}
            <p className="text-2xl md:text-3xl font-black text-[#b91c1c] tracking-wider mb-6">
              {formatVND(product.gia)}
            </p>

            {/* Đường kẻ */}
            <div className="border-t border-white/10 mb-6" />

            {/* Mô tả sản phẩm */}
            {product.moTa && (() => {
              // Tách mô tả thành các bullet points bằng xuống dòng hoặc chấm câu
              const bullets = product.moTa
                .split(/[\n※•\*]+|\.(?=\s|$)/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);

              return (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-[#b91c1c] rounded-full" />
                    <p className="text-[11px] font-black text-white uppercase tracking-[0.15em]">
                      Mô tả sản phẩm
                    </p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
                    {bullets.length > 1 ? (
                      bullets.map((line: string, i: number) => (
                        <div key={i} className="flex gap-2.5 items-start">
                          <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#b91c1c]/70" />
                          <p className="text-sm text-gray-300 leading-relaxed">{line}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{product.moTa}</p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── Chọn Size ── */}
            <div className="mb-6">
              <p className="text-[11px] font-black text-white uppercase tracking-[0.15em] mb-3">
                Kích thước {selectedSize && <span className="text-gray-500 normal-case tracking-normal font-normal">— {selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSelectedColor("");
                    }}
                    className={`min-w-[48px] h-11 px-4 rounded-md text-sm font-bold uppercase tracking-wider transition-all border ${selectedSize === size
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-gray-400 border-white/15 hover:border-white/40 hover:text-white"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Chọn Màu sắc ── */}
            <div className="mb-6">
              <p className="text-[11px] font-black text-white uppercase tracking-[0.15em] mb-3">
                Màu sắc {selectedColor && <span className="text-gray-500 normal-case tracking-normal font-normal">— {selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedImageIndex(0); // Reset về ảnh đầu tiên của màu mới
                    }}
                    className={`min-w-[48px] h-11 px-4 rounded-md text-sm font-bold transition-all border ${selectedColor === color
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-gray-400 border-white/15 hover:border-white/40 hover:text-white"
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tồn kho ── */}
            {selectedVariant && (
              <p className="text-xs text-gray-500 mb-6 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedVariant.soLuong > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                {selectedVariant.soLuong > 0 ? `Còn ${selectedVariant.soLuong} sản phẩm` : "Hết hàng"}
              </p>
            )}

            {/* ── Số lượng + Nút mua ── */}
            <div className="flex flex-col gap-4 mb-4">
              {/* Box Cột 1: Số lượng thả ngang với các nút */}
              <div className="flex items-center gap-4">
                {/* Bộ chọn số lượng */}
                <div className="flex items-center border border-white/15 rounded-md overflow-hidden bg-transparent h-12 flex-shrink-0">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 h-full flex items-center justify-center text-sm font-bold text-white border-x border-white/15">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-11 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Yêu thích */}
                <button className="w-12 h-12 flex items-center justify-center rounded-md border border-white/15 text-gray-400 hover:text-[#b91c1c] hover:border-[#b91c1c] transition-all flex-shrink-0">
                  <Heart size={20} />
                </button>
              </div>

              {/* Các nút hành động chính */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Nút thêm giỏ hàng */}
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className={`flex-1 h-12 flex items-center justify-center gap-2.5 rounded-md text-sm font-black uppercase tracking-widest transition-all border ${addedSuccess
                      ? "bg-emerald-600/20 text-emerald-500 border-emerald-600/30"
                      : canAddToCart
                        ? "bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/40 active:scale-[0.98]"
                        : "bg-white/5 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check size={18} /> Đã thêm!
                    </>
                  ) : adding ? (
                    "Đang thêm..."
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Thêm vào giỏ
                    </>
                  )}
                </button>
                
                {/* Nút mua ngay */}
                <button
                  onClick={handleBuyNow}
                  disabled={!canAddToCart}
                  className={`flex-1 h-12 flex items-center justify-center gap-2.5 rounded-md text-sm font-black uppercase tracking-widest transition-all ${
                    canAddToCart
                      ? "bg-[#b91c1c] text-white hover:bg-[#991b1b] shadow-[0_0_20px_rgba(185,28,28,0.3)] hover:shadow-[0_0_25px_rgba(185,28,28,0.5)] active:scale-[0.98]"
                      : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                  }`}
                >
                  <Zap size={18} className={canAddToCart ? "text-yellow-400" : ""} /> Mua ngay
                </button>
              </div>
            </div>

            {/* ── Cam kết ── */}
            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Truck size={18} className="text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Miễn phí giao hàng</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Đơn hàng từ 500.000₫ trở lên</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <RotateCcw size={18} className="text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Đổi trả miễn phí</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Trong vòng 30 ngày kể từ ngày mua</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield size={18} className="text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Cam kết chính hãng</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Sản phẩm chính hãng 100%</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
