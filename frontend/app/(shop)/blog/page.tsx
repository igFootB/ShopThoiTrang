"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, ArrowRight, Search } from "lucide-react";

/* ─── Mock Blog Data ─── */
const BLOG_POSTS = [
  {
    id: 1,
    title: "XU HƯỚNG THỜI TRANG MÙA XUÂN 2026",
    excerpt: "Cùng khám phá những thiết kế được săn đón nhất trong bộ sưu tập mùa Xuân năm nay. Từ sắc màu pastel lãng mạn tới những kiểu dáng độc đáo mang đậm phong cách cổ điển.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
    date: "08 Tháng 03, 2026",
    category: "Xu hướng",
    readTime: "5 phút đọc",
  },
  {
    id: 2,
    title: "BÍ QUYẾT PHỐI ĐỒ CÔNG SỞ THANH LỊCH",
    excerpt: "Gợi ý 5 set đồ công sở thanh lịch tôn dáng giúp bạn tự tin toả sáng tại văn phòng. Làm mới tủ đồ bằng các bí kíp đơn giản nhưng cực kỳ tinh tế.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
    date: "05 Tháng 03, 2026",
    category: "Phong cách",
    readTime: "4 phút đọc",
  },
  {
    id: 3,
    title: "HƯỚNG DẪN BẢO QUẢN QUẦN ÁO ĐÚNG CÁCH",
    excerpt: "Bảo vệ và duy trì độ bền của những thiết kế hàng hiệu bằng các lưu ý trong quy trình giặt là và bảo quản vải chất liệu cao cấp mỗi ngày.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
    date: "01 Tháng 03, 2026",
    category: "Mẹo hay",
    readTime: "6 phút đọc",
  },
  {
    id: 4,
    title: "BỘ SƯU TẬP MÙA HÈ – NĂNG ĐỘNG & PHÓNG KHOÁNG",
    excerpt: "Khám phá bộ sưu tập mùa Hè với những thiết kế trẻ trung, năng động, phù hợp cho mọi hoạt động ngoài trời từ du lịch biển đến dã ngoại cuối tuần.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
    date: "25 Tháng 02, 2026",
    category: "Bộ sưu tập",
    readTime: "5 phút đọc",
  },
  {
    id: 5,
    title: "PHONG CÁCH MINIMALIST – ÍT MÀ CHẤT",
    excerpt: "Triết lý \"Less is more\" trong thời trang – cách xây dựng tủ đồ capsule wardrobe với những item cơ bản nhưng luôn sành điệu và đẳng cấp.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800&auto=format&fit=crop",
    date: "20 Tháng 02, 2026",
    category: "Phong cách",
    readTime: "7 phút đọc",
  },
  {
    id: 6,
    title: "CÁCH CHỌN VEST PHÙ HỢP VỚI DÁNG NGƯỜI",
    excerpt: "Hướng dẫn chi tiết cách chọn kiểu vest, chất liệu và màu sắc phù hợp với từng vóc dáng để luôn lịch lãm và tự tin trong mọi sự kiện.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    date: "15 Tháng 02, 2026",
    category: "Mẹo hay",
    readTime: "8 phút đọc",
  },
];

const CATEGORIES = ["Tất cả", "Xu hướng", "Phong cách", "Mẹo hay", "Bộ sưu tập"];

export default function BlogPage() {
  const [selectedCat, setSelectedCat] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchCat = selectedCat === "Tất cả" || post.category === selectedCat;
    const matchSearch = !searchQuery.trim() || post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredPost = BLOG_POSTS[0];

  return (
    <div className="bg-[#111] w-full min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[280px] md:h-[380px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1920&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-[0.2em] mb-4">
            TIN TỨC
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-xl tracking-wider">
            Cập nhật xu hướng thời trang, mẹo phối đồ và những bí quyết phong cách mới nhất.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Featured Post ── */}
        <section className="mb-16">
          <Link href={`/blog/${featuredPost.id}`} className="group block">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
              <div className="aspect-[16/10] lg:aspect-auto overflow-hidden relative">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  style={{ backgroundImage: `url('${featuredPost.image}')` }}
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="text-[10px] font-black text-[#b91c1c] uppercase tracking-[0.2em] mb-4">
                  {featuredPost.category} • BÀI VIẾT NỔI BẬT
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.1em] leading-relaxed mb-4 group-hover:text-gray-300 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest">
                    <Calendar size={12} />
                    {featuredPost.date}
                  </div>
                  <span className="flex items-center gap-2 text-[11px] font-bold text-white uppercase tracking-widest group-hover:text-[#b91c1c] transition-colors">
                    Đọc thêm <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ── Filter Bar ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 border-b border-white/10 pb-8">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCat === cat
                    ? "bg-[#b91c1c] text-white"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Tìm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-2.5 pl-10 pr-4 focus:outline-none focus:border-white/30 placeholder:text-gray-500 transition-colors"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* ── Blog Grid ── */}
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-gray-400 text-lg mb-2">Không tìm thấy bài viết nào</p>
            <p className="text-gray-500 text-sm">Hãy thử thay đổi bộ lọc nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.id}`} key={post.id} className="group flex flex-col h-full">
                <article className="flex flex-col h-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all hover:translate-y-[-4px] duration-300">
                  {/* Ảnh */}
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                      style={{ backgroundImage: `url('${post.image}')` }}
                    />
                    {/* Badge danh mục */}
                    <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-[0.15em] px-3 py-1.5 rounded-full z-10">
                      {post.category}
                    </span>
                  </div>

                  {/* Nội dung */}
                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-[13px] md:text-sm font-black text-white uppercase tracking-[0.08em] leading-relaxed mb-3 line-clamp-2 group-hover:text-gray-300 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto flex items-center gap-2 text-[11px] font-bold text-gray-500 group-hover:text-[#b91c1c] transition-colors uppercase tracking-widest">
                      Đọc thêm <ArrowRight size={12} />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
