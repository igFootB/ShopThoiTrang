"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import HeroSlider from "@/components/ui/HeroSlider";
import HighlightCollection from "@/components/ui/HighlightCollection";
import { publicProductsApi, publicCategoriesApi, publicLookbookApi } from "@/lib/api";

// Helper: loại bỏ sản phẩm trùng ID
function dedupProducts(arr: any[]): any[] {
  return Array.from(new Map(arr.map(p => [String(p.id), p])).values());
}

export default function HomePage() {
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [namProducts, setNamProducts] = useState<any[]>([]);
  const [nuProducts, setNuProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [lookbooks, setLookbooks] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Bán chạy (Sản phẩm mới nhất)
    publicProductsApi.getProducts({ limit: 4 }).then((res) => {
      setNewProducts(dedupProducts(res.data.content || []));
    }).catch(console.error);

    // Fetch Danh mục để lọc Nam / Nữ và render Danh mục nổi bật
    publicCategoriesApi.getCategories().then((res) => {
      const cats: any[] = res.data;
      const activeCats = cats.filter(c => c.trangThai === 1);
      setCategories(activeCats);

      const namIds = activeCats.filter(c => c.gioiTinh === "NAM").map(c => c.id);
      if (namIds.length > 0) {
        Promise.all(namIds.map(id => publicProductsApi.getProducts({ categoryId: id, limit: 4 })))
          .then(results => {
            const allProducts = results.flatMap(res => res.data.content || []);
            if (allProducts.length > 0) {
              setNamProducts(dedupProducts(allProducts).slice(0, 4));
            } else {
              publicProductsApi.getProducts({ keyword: "nam", limit: 4 }).then(res => setNamProducts(res.data.content || []));
            }
          });
      } else {
        publicProductsApi.getProducts({ keyword: "nam", limit: 4 }).then(res => setNamProducts(res.data.content || []));
      }

      const nuIds = activeCats.filter(c => c.gioiTinh === "NU").map(c => c.id);
      if (nuIds.length > 0) {
        Promise.all(nuIds.map(id => publicProductsApi.getProducts({ categoryId: id, limit: 4 })))
          .then(results => {
            const allProducts = results.flatMap(res => res.data.content || []);
            if (allProducts.length > 0) {
              setNuProducts(dedupProducts(allProducts).slice(0, 4));
            } else {
              publicProductsApi.getProducts({ keyword: "nữ", limit: 4 }).then(res => setNuProducts(res.data.content || []));
            }
          });
      } else {
        publicProductsApi.getProducts({ keyword: "nữ", limit: 4 }).then(res => setNuProducts(res.data.content || []));
      }
    }).catch(console.error);

    // Fetch Lookbook
    publicLookbookApi.getLookbooks({ limit: 6 }).then((res) => {
      setLookbooks(res.data.content || []);
    }).catch(console.error);
  }, []);
  return (
    <div className="bg-[#1c1c1c] w-full min-h-screen pb-24 text-white -mt-28">

      {/* ── 1. Hero Banner Slider ── */}
      <HeroSlider />

      {/* ── 2. NEW COLLECTION (3 Hình) ── */}
      <section className="w-full max-w-[1200px] mx-auto px-4 mt-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div className="flex flex-col items-center">
            <Link href="/category/nam" className="w-full aspect-[4/3] block overflow-hidden bg-[#222] relative group">
              <Image
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"
                alt="New Collection Men"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
            <div className="mt-4 text-center">
              <h3 className="text-sm font-semibold tracking-wide uppercase">NEW COLLECTION</h3>
              <Link href="/category/nam" className="text-xs text-[#b91c1c] italic mt-1 inline-block hover:underline">Xem ngay</Link>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Link href="/category/nu" className="w-full aspect-[4/3] block overflow-hidden bg-[#222] relative group">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
                alt="New Collection Women"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
            <div className="mt-4 text-center">
              <h3 className="text-sm font-semibold tracking-wide uppercase">NEW COLLECTION</h3>
              <Link href="/category/nu" className="text-xs text-[#b91c1c] italic mt-1 inline-block hover:underline">Xem ngay</Link>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Link href="/category/nam" className="w-full aspect-[4/3] block overflow-hidden bg-[#222] relative group">
              <Image
                src="https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop"
                alt="New Collection Shirts"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
            <div className="mt-4 text-center">
              <h3 className="text-sm font-semibold tracking-wide uppercase">NEW COLLECTION</h3>
              <Link href="/category/nam" className="text-xs text-[#b91c1c] italic mt-1 inline-block hover:underline">Xem ngay</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Separator ── */}
      <div className="w-full text-center mb-10 mt-20">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-widest uppercase">THỜI TRANG NAM</h2>
      </div>

      {/* ── 3. Best Sellers Banner Nam ── */}
      <section className="w-full max-w-[1200px] mx-auto px-4 mb-4">
        <div className="w-full relative bg-[#222] flex flex-col md:flex-row overflow-hidden min-h-[400px] md:min-h-[500px]">
          {/* Left Large Image */}
          <div className="w-full md:w-2/3 relative min-h-[300px] md:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1613243555988-441166d482cc?q=80&w=1200&auto=format&fit=crop"
              alt="Best Sellers"
              fill
              className="object-cover"
            />
            {/* Overlay Text */}
            <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 text-right">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white uppercase tracking-wider mb-2 drop-shadow-sm">
                BEST
                <br />
                SELLERS
              </h2>
              <p className="text-xl md:text-2xl font-serif italic text-white/90 drop-shadow-sm">Best Dressed</p>
            </div>
          </div>

          {/* Right Smaller Image & Tags (Only visible on larger screens) */}
          <div className="hidden md:flex flex-col md:w-1/3 bg-[#2a2a2a] p-8 items-center justify-center relative">
            <div className="w-full aspect-[3/4] relative bg-[#111] shadow-sm border border-white/10 p-2">
              <div className="w-full h-full relative">
                <Image
                  src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800&auto=format&fit=crop"
                  alt="Best Seller Item"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex justify-between w-full mt-4 text-[#888] text-sm">
              <span>#menstyle</span>
              <span>#casual</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Thời Trang Nam Products Grid (8 items) ── */}
      <section className="w-full max-w-[1200px] mx-auto px-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {namProducts.slice(0, 8).map((product, idx) => (
            <ProductCard key={`nam-${product.id}-${idx}`} product={product} />
          ))}
        </div>
        <div className="text-center mt-8 w-full flex justify-center">
          <Link href="/category/nam" className="inline-block px-8 py-3 border border-white text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-300">
            XEM TẤT CẢ
          </Link>
        </div>
      </section>

      {/* ── Brand Separator Nữ ── */}
      <div className="w-full text-center mb-10 mt-24">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-widest uppercase">THỜI TRANG NỮ</h2>
      </div>

      {/* ── 3. Best Sellers Banner Nữ ── */}
      <section className="w-full max-w-[1200px] mx-auto px-4 mb-4">
        <div className="w-full relative bg-[#222] flex flex-col md:flex-row overflow-hidden min-h-[400px] md:min-h-[500px]">
          {/* Left Large Image */}
          <div className="w-full md:w-2/3 relative min-h-[300px] md:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
              alt="Best Sellers Nu"
              fill
              className="object-cover"
            />
            {/* Overlay Text */}
            <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 text-right">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white uppercase tracking-wider mb-2 drop-shadow-md">
                BEST
                <br />
                SELLERS
              </h2>
              <p className="text-xl md:text-2xl font-serif italic text-white/90 drop-shadow-md">Best Dressed</p>
            </div>
          </div>

          {/* Right Smaller Image & Tags (Only visible on larger screens) */}
          <div className="hidden md:flex flex-col md:w-1/3 bg-[#2a2a2a] p-8 items-center justify-center relative">
            <div className="w-full aspect-[3/4] relative bg-[#111] shadow-sm border border-white/10 p-2">
              <div className="w-full h-full relative">
                <Image
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop"
                  alt="Best Seller Item Nu"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex justify-between w-full mt-4 text-[#888] text-sm">
              <span>#womenstyle</span>
              <span>#elegant</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Thời Trang Nữ Products Grid (8 items) ── */}
      <section className="w-full max-w-[1200px] mx-auto px-4 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {nuProducts.slice(0, 8).map((product, idx) => (
            <ProductCard key={`nu-${product.id}-${idx}`} product={product} />
          ))}
        </div>
        <div className="text-center mt-8 w-full flex justify-center">
          <Link href="/category/nu" className="inline-block px-8 py-3 border border-white text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-300">
            XEM TẤT CẢ
          </Link>
        </div>
      </section>

      {/* ── Brand Separator & Mix/Match ── */}
      <div className="w-full text-center mb-10">
        <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase">MIX & MATCH</h2>
      </div>

      {/* ── 5. Mix & Match ── */}
      <section className="w-full max-w-[1200px] mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
          {lookbooks.length > 0 ? (
            lookbooks.slice(0, 3).map((lbItem, idx) => (
              <Link key={`lb-${lbItem.id || idx}`} href={`/lookbook/${lbItem.id}`} className="group block w-full aspect-[3/4] relative overflow-hidden bg-[#222]">
                <Image
                  src={lbItem.hinhAnh}
                  alt={lbItem.tieuDe || `Mix & Match ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
            ))
          ) : (
            // Fallback content if no Lookbooks are provided by the API
            <>
              <Link href="/category/nam" className="group block w-full aspect-[3/4] relative overflow-hidden bg-[#222]">
                <Image
                  src="https://images.unsplash.com/photo-1490240989397-ff0b51eb6404?q=80&w=800&auto=format&fit=crop"
                  alt="Mix & Match 1"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
              <Link href="/category/nu" className="group block w-full aspect-[3/4] relative overflow-hidden bg-[#222]">
                <Image
                  src="https://images.unsplash.com/photo-1550614000-4b95d4edae10?q=80&w=800&auto=format&fit=crop"
                  alt="Mix & Match 2"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
              <Link href="/category/nam" className="group block w-full aspect-[3/4] relative overflow-hidden bg-[#222]">
                <Image
                  src="https://images.unsplash.com/photo-1594938291221-94f18cbb5660?q=80&w=800&auto=format&fit=crop"
                  alt="Mix & Match 3"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Brand Separator Blog ── */}
      <div className="w-full text-center mb-10">
        <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase">BLOG</h2>
      </div>

      {/* ── 6. Blog Section ── */}
      <section className="w-full max-w-[1200px] mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Blog 1 */}
          <div className="group cursor-pointer flex flex-col h-full">
            <div className="aspect-[16/9] w-full mb-4 overflow-hidden relative bg-[#222]">
              <Image
                src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop"
                alt="Blog 1"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="text-xs text-gray-400 mb-2">11/03/2026</p>
            <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 uppercase group-hover:text-gray-300 transition-colors">
              NEW OXFORD SHIRTS | Sơ Mi Oxford Th...
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              Trong tủ đồ nam giới, sơ mi luôn là biểu tượng của sự lịch lãm và phong cách trưởng thành.
            </p>
          </div>

          {/* Blog 2 */}
          <div className="group cursor-pointer flex flex-col h-full">
            <div className="aspect-[16/9] w-full mb-4 overflow-hidden relative bg-[#222]">
              <Image
                src="https://images.unsplash.com/photo-1434389670869-c4514a383569?q=80&w=800&auto=format&fit=crop"
                alt="Blog 2"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="text-xs text-gray-400 mb-2">09/03/2026</p>
            <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 uppercase group-hover:text-gray-300 transition-colors">
              NEW ARRIVAL OUTFIT - Set Đồ Minimal...
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              Trong xu hướng thời trang nữ tối giản, những set đồ đồng điệu về màu sắc luôn được ưa chuộng.
            </p>
          </div>

          {/* Blog 3 */}
          <div className="group cursor-pointer flex flex-col h-full">
            <div className="aspect-[16/9] w-full mb-4 overflow-hidden relative bg-[#222]">
              <Image
                src="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop"
                alt="Blog 3"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="text-xs text-gray-400 mb-2">09/03/2026</p>
            <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 uppercase group-hover:text-gray-300 transition-colors">
              SLIM FIT JEANS - MADE FOR YOUR DAY ...
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
              Trong thế giới thời trang nam, jeans luôn là item không thể thiếu với mọi chàng trai năng động.
            </p>
          </div>
        </div>

        <div className="text-center mt-12 w-full flex justify-center">
          <Link href="/blog" className="inline-block px-8 py-3 border border-white text-sm font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-300">
            XEM TẤT CẢ
          </Link>
        </div>
      </section>

    </div>
  );
}
