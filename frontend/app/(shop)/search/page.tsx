"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { publicProductsApi, publicCategoriesApi } from "@/lib/api";
import ProductCard from "@/components/ui/ProductCard";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Search, ChevronDown } from "lucide-react";
import Link from "next/link";

/* ─── Bộ lọc giá (khoảng giá) ─── */
const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 300.000₫", min: 0, max: 300000 },
  { label: "300.000₫ – 500.000₫", min: 300000, max: 500000 },
  { label: "500.000₫ – 1.000.000₫", min: 500000, max: 1000000 },
  { label: "1.000.000₫ – 2.000.000₫", min: 1000000, max: 2000000 },
  { label: "Trên 2.000.000₫", min: 2000000, max: Infinity },
];

type ProductItem = {
  id: number;
  tenSanPham: string;
  gia: number;
  thumbnail: string | null;
  danhMucId?: number;
};

type PageResponse = {
  content: ProductItem[];
  totalPages: number;
  totalElements: number;
  number: number;
};

const LIMIT = 12;

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  
  /* ─── Filter states ─── */
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
  });

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasActiveFilter = selectedPriceRange !== 0 || selectedCategoryId !== null || searchKeyword.trim() !== "";

  const clearAllFilters = () => {
    setSelectedPriceRange(0);
    setSelectedCategoryId(null);
    setSearchKeyword("");
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const res = await publicProductsApi.getProducts({ 
        keyword: q, 
        page, 
        limit: LIMIT 
      });
      
      const data = res.data;
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      
      // Cũng fetch categories để làm bộ lọc 
      const catRes = await publicCategoriesApi.getCategories();
      if (catRes.data) {
          const activeCats = catRes.data.filter((c: any) => c.trangThai === 1).map((c: any) => ({
              id: c.id,
              name: c.tenDanhMuc
          }));
          
          // Lọc ra các category duy nhất dựa trên name nếu cần
          const uniqueCats = Array.from(new Map(activeCats.map((item: any) => [item.name, item])).values()) as any[];
          
          setCategories(uniqueCats);
      }
      
    } catch (e) {
      console.error(e);
      setProducts([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    setPage(0); // Reset page when query changes
  }, [q]);

  useEffect(() => {
    if (q) {
      fetchProducts();
    } else {
      setProducts([]);
      setTotalPages(0);
      setTotalElements(0);
      setLoading(false);
    }
  }, [fetchProducts, q]);

  /* ─── Lọc + Sắp xếp locally ─── */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Lọc theo khoảng giá
    const range = PRICE_RANGES[selectedPriceRange];
    if (range && (range.min > 0 || range.max < Infinity)) {
      result = result.filter((p) => p.gia >= range.min && p.gia <= range.max);
    }
    
    // Lọc theo từ khoá tìm kiếm thêm (trong bộ lọc)
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter((p) => p.tenSanPham.toLowerCase().includes(kw));
    }

    // Sắp xếp
    if (sortBy === "price-asc") result.sort((a, b) => a.gia - b.gia);
    else if (sortBy === "price-desc") result.sort((a, b) => b.gia - a.gia);

    return result;
  }, [products, selectedPriceRange, searchKeyword, sortBy]);

  /* ─── Sidebar Filter UI ─── */
  const FilterSidebar = (
    <div className="space-y-6">
      {/* Tìm kiếm thêm */}
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="Lọc trong kết quả..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/30 placeholder:text-gray-500 transition-colors"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          {searchKeyword && (
            <button onClick={() => setSearchKeyword("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Khoảng giá */}
      <div className="border-t border-white/10 pt-5">
        <button onClick={() => toggleSection("price")} className="flex items-center justify-between w-full text-left mb-4">
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Khoảng giá</h4>
          <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${expandedSections.price ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.price && (
          <div className="space-y-1">
            {PRICE_RANGES.map((range, i) => (
              <button
                key={range.label}
                onClick={() => setSelectedPriceRange(i)}
                className={`w-full text-left py-2 px-3 rounded-md text-sm transition-all ${
                  selectedPriceRange === i
                    ? "bg-[#b91c1c] text-white font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nút xoá bộ lọc */}
      {hasActiveFilter && (
        <button
          onClick={clearAllFilters}
          className="w-full mt-4 py-2.5 border border-white/20 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/40 transition-all uppercase tracking-widest font-bold"
        >
          Xoá bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-[#111] w-full min-h-screen pt-20">
      {/* ── Page Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.1em] mb-2">
          Kết quả tìm kiếm
        </h1>
        <p className="text-gray-400 text-sm">
          {q ? (
            <>Tìm thấy <span className="text-white font-bold">{totalElements}</span> kết quả cho từ khoá &quot;<span className="text-white font-bold">{q}</span>&quot;</>
          ) : (
             "Vui lòng nhập từ khoá để tìm kiếm"
          )}
        </p>
      </div>

      {/* ── Main Content (Sidebar + Grid) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-28">
              {FilterSidebar}
            </div>
          </aside>

          {/* ── Content Area ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                {/* Nút mở filter trên Mobile */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 hover:text-white hover:border-white/30 transition-all"
                >
                  <SlidersHorizontal size={16} />
                  Bộ lọc
                  {hasActiveFilter && <span className="w-2 h-2 rounded-full bg-[#b91c1c]" />}
                </button>

                <p className="text-sm text-gray-400 tracking-wider">
                  Hiển thị <span className="text-white font-bold">{filteredProducts.length}</span> / {totalElements} sản phẩm
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1a1a1a] text-sm text-white border border-white/10 rounded-md px-4 py-2 focus:outline-none focus:border-white/30 cursor-pointer appearance-none"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

             {/* Active Filters Tags */}
             {hasActiveFilter && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPriceRange !== 0 && (
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300">
                    {PRICE_RANGES[selectedPriceRange].label}
                    <button onClick={() => setSelectedPriceRange(0)} className="text-gray-500 hover:text-white"><X size={12} /></button>
                  </span>
                )}
                {searchKeyword.trim() && (
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300">
                    &quot;{searchKeyword}&quot;
                    <button onClick={() => setSearchKeyword("")} className="text-gray-500 hover:text-white"><X size={12} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white/5 aspect-[3/4] rounded-md" />
                    <div className="mt-3 h-3 bg-white/5 rounded w-3/4" />
                    <div className="mt-2 h-3 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border top border-white/5 rounded-2xl bg-white/[0.02]">
                <Search size={48} className="text-gray-600 mb-6" />
                <h2 className="text-white text-xl font-bold mb-2">Không tìm thấy sản phẩm nào phù hợp</h2>
                <p className="text-gray-400 text-sm mb-6 max-w-md">Chúng tôi không tìm thấy kết quả nào cho &quot;<span className="text-white">{q}</span>&quot;. Hãy thử kiểm tra lại lỗi chính tả hoặc dùng từ khoá chung chung hơn.</p>
                <Link href="/" className="bg-[#b91c1c] text-white px-8 py-3 rounded-md text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
                  Tiếp tục mua sắm
                </Link>
                {hasActiveFilter && (
                  <button onClick={clearAllFilters} className="mt-6 text-sm text-gray-400 hover:text-white font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                    <X size={16} />
                    Xoá tất cả bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                      page === i
                        ? "bg-[#b91c1c] text-white"
                        : "text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Overlay ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsMobileFilterOpen(false)} />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-[300px] bg-[#1a1a1a] p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Bộ lọc</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-400 hover:text-white">
                <X size={22} />
              </button>
            </div>
            {FilterSidebar}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center text-white">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
