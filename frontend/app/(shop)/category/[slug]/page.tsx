"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { api, publicCategoriesApi } from "@/lib/api";
import ProductCard from "@/components/ui/ProductCard";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Search, ChevronDown } from "lucide-react";

/* ─── Slug → Category map ─── */
const CATEGORY_MAP: Record<string, { id: number; title: string; banner: string; desc: string }> = {
  nam: {
    id: 1,
    title: "THỜI TRANG NAM",
    banner: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1920&auto=format&fit=crop",
    desc: "Phong cách nam tính, lịch lãm & hiện đại – từ công sở đến dạo phố.",
  },
  nu: {
    id: 2,
    title: "THỜI TRANG NỮ",
    banner: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1920&auto=format&fit=crop",
    desc: "Thanh lịch, quyến rũ & tự tin – bộ sưu tập dành riêng cho phái đẹp.",
  },
};

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
};

type PageResponse = {
  content: ProductItem[];
  totalPages: number;
  totalElements: number;
  number: number;
};

const LIMIT = 12;

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug ?? "nam";
  const [pageInfo, setPageInfo] = useState({
    title: CATEGORY_MAP[slug]?.title || "DANH MỤC THỜI TRANG",
    banner: CATEGORY_MAP[slug]?.banner || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?q=80&w=1920&auto=format&fit=crop",
    desc: CATEGORY_MAP[slug]?.desc || "Khám phá bộ sưu tập thời trang mới nhất",
  });

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Danh mục con lấy động từ API (ví dụ: Áo, Quần)
  const [dynamicSubCats, setDynamicSubCats] = useState<string[]>(["Tất cả"]);

  /* ─── Filter states ─── */
  const [selectedPriceRange, setSelectedPriceRange] = useState(0); // index trong PRICE_RANGES
  const initialSubCat = searchParams.get("subcat") || "Tất cả";
  const [selectedSubCat, setSelectedSubCat] = useState(initialSubCat);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    subcat: true,
    price: true,
  });

  // Theo dõi url params changes để tự động đổi tab subcat
  useEffect(() => {
    const sub = searchParams.get("subcat");
    if (sub) {
      setSelectedSubCat(sub);
    }
  }, [searchParams]);

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasActiveFilter = selectedPriceRange !== 0 || selectedSubCat !== "Tất cả" || searchKeyword.trim() !== "";

  const clearAllFilters = () => {
    setSelectedPriceRange(0);
    setSelectedSubCat("Tất cả");
    setSearchKeyword("");
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const catRes = await publicCategoriesApi.getCategories();
      const allCats = catRes.data || [];
      const activeCats = allCats.filter((c: any) => c.trangThai === 1);
      
      let targetCatIds: number[] = [];
      let targetNames: string[] = [];
      let targetRoot: any = null;
      
      const isNumeric = /^\d+$/.test(slug);

      if (isNumeric) {
        targetRoot = activeCats.find((c: any) => c.id === parseInt(slug, 10));
        if (targetRoot) {
          targetCatIds = [targetRoot.id];
          targetNames = [targetRoot.tenDanhMuc];
        }
      } else {
        const gioiTinh = slug.toUpperCase();
        const children = activeCats.filter((c: any) => c.gioiTinh === gioiTinh);
        targetCatIds = children.map((c: any) => c.id);
        targetNames = children.map((c: any) => c.tenDanhMuc);
        
        if (children.length > 0) {
          targetRoot = {
            tenDanhMuc: CATEGORY_MAP[slug]?.title || `Thời trang ${gioiTinh}`,
            hinhAnh: CATEGORY_MAP[slug]?.banner,
            moTa: CATEGORY_MAP[slug]?.desc
          };
        }
      }

      if (targetRoot) {
         setPageInfo({
           title: targetRoot.tenDanhMuc.toUpperCase(),
           banner: targetRoot.hinhAnh || CATEGORY_MAP[slug]?.banner || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?q=80&w=1920&auto=format&fit=crop",
           desc: targetRoot.moTa || CATEGORY_MAP[slug]?.desc || "Danh mục sản phẩm",
         });
      }

      // Sidebar danh mục con
      const uniqueNames = Array.from(new Set(targetNames)).filter(Boolean) as string[];
      setDynamicSubCats(["Tất cả", ...uniqueNames]);

      if (targetCatIds.length > 0) {
        // Fetch tất cả sản phẩm thuộc các IDs tìm thấy
        const results = await Promise.all(
          targetCatIds.map(id => api.get<PageResponse>("/products", { params: { categoryId: id, page, limit: LIMIT } }))
        );
        const allProducts = results.flatMap(res => res.data.content || []);
        
        // Loại bỏ trùng (do một map backend call có thể có items giống nhau nếu limit/page overlap)
        const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values());
        
        setProducts(uniqueProducts);
        setTotalPages(1); 
        setTotalElements(uniqueProducts.length);
      } else {
        // TrFallback filter tay nếu không tìm thấy ID nào
        const res = await api.get<PageResponse>("/products", {
          params: { keyword: slug === "nu" ? "nữ" : "nam", page, limit: LIMIT },
        });
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
      
    } catch (e) {
      console.error(e);
      setProducts([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, slug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ─── Lọc + Sắp xếp locally ─── */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Lọc theo khoảng giá
    const range = PRICE_RANGES[selectedPriceRange];
    if (range && (range.min > 0 || range.max < Infinity)) {
      result = result.filter((p) => p.gia >= range.min && p.gia <= range.max);
    }

    // Lọc theo danh mục con (dựa trên tên sản phẩm)
    if (selectedSubCat !== "Tất cả") {
      const kw = selectedSubCat.toLowerCase();
      result = result.filter((p) => p.tenSanPham.toLowerCase().includes(kw));
    }

    // Lọc theo từ khoá tìm kiếm
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter((p) => p.tenSanPham.toLowerCase().includes(kw));
    }

    // Sắp xếp
    if (sortBy === "price-asc") result.sort((a, b) => a.gia - b.gia);
    else if (sortBy === "price-desc") result.sort((a, b) => b.gia - a.gia);

    // Loại bỏ sản phẩm trùng ID
    const seen = new Set<number>();
    return result.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [products, selectedPriceRange, selectedSubCat, searchKeyword, sortBy]);

  /* ─── Sidebar Filter UI (dùng chung cho Desktop & Mobile) ─── */
  const FilterSidebar = (
    <div className="space-y-6">
      {/* Tìm kiếm */}
      <div>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
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

      {/* Danh mục con */}
      <div className="border-t border-white/10 pt-5">
        <button onClick={() => toggleSection("subcat")} className="flex items-center justify-between w-full text-left mb-4">
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Loại sản phẩm</h4>
          <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${expandedSections.subcat ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.subcat && (
          <div className="space-y-1">
            {dynamicSubCats.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setSelectedSubCat(cat)}
                className={`w-full text-left py-2 px-3 rounded-md text-sm transition-all ${
                  selectedSubCat === cat
                    ? "bg-[#b91c1c] text-white font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
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
    <div className="bg-[#111] w-full min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[280px] md:h-[380px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('${pageInfo.banner}')` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em] mb-4">
            {pageInfo.title}
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-xl tracking-wider">
            {pageInfo.desc}
          </p>
        </div>
      </section>

      {/* ── Main Content (Sidebar + Grid) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                {selectedSubCat !== "Tất cả" && (
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-gray-300">
                    {selectedSubCat}
                    <button onClick={() => setSelectedSubCat("Tất cả")} className="text-gray-500 hover:text-white"><X size={12} /></button>
                  </span>
                )}
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white/5 aspect-[3/4] rounded-md" />
                    <div className="mt-3 h-3 bg-white/5 rounded w-3/4" />
                    <div className="mt-2 h-3 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm nào phù hợp</p>
                <p className="text-gray-500 text-sm mb-6">Hãy thử điều chỉnh bộ lọc nhé!</p>
                {hasActiveFilter && (
                  <button onClick={clearAllFilters} className="text-sm text-[#b91c1c] hover:text-red-400 font-bold uppercase tracking-widest transition-colors">
                    Xoá tất cả bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
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
