"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Calendar, Clock, ArrowLeft, ChevronRight, Facebook, Share2 } from "lucide-react";

/* ─── Mock Blog Data (dữ liệu mẫu) ─── */
const BLOG_POSTS = [
  {
    id: 1,
    title: "XU HƯỚNG THỜI TRANG MÙA XUÂN 2026",
    excerpt: "Cùng khám phá những thiết kế được săn đón nhất trong bộ sưu tập mùa Xuân năm nay.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
    date: "08 Tháng 03, 2026",
    category: "Xu hướng",
    readTime: "5 phút đọc",
    author: "John Henry",
    content: `
Mùa Xuân 2026 mang đến một làn gió thời trang hoàn toàn mới với sự kết hợp giữa phong cách cổ điển và hiện đại. Từ những sàn diễn lớn trên thế giới, chúng ta đã nắm bắt được những xu hướng nổi bật nhất.

## Sắc Màu Pastel Lãng Mạn

Gam màu pastel tiếp tục thống trị trong mùa Xuân 2026. Từ hồng phấn nhẹ nhàng, xanh mint thanh thoát đến tím lavender mộng mơ – tất cả đều mang đến vẻ ngoài tươi sáng và đầy sức sống.

Các nhà thiết kế đã khéo léo kết hợp những tông màu này vào từ áo sơ mi, váy đầm cho đến các phụ kiện, tạo nên một tổng thể hài hòa và tinh tế.

## Chất Liệu Tự Nhiên Lên Ngôi

Linen, cotton organic và silk tự nhiên là những chất liệu được ưa chuộng nhất trong mùa này. Không chỉ thân thiện với môi trường, chúng còn mang lại cảm giác thoáng mát và thoải mái cho người mặc.

## Phong Cách Layering Thanh Lịch

Kỹ thuật layering (xếp lớp) được ứng dụng một cách tinh tế hơn bao giờ hết. Một chiếc áo blouse mỏng kết hợp với vest oversize hoặc cardigan nhẹ sẽ tạo nên phong cách vừa thanh lịch vừa cá tính.

## Phụ Kiện Statement

Túi xách oversized, kính mát cat-eye và giày loafer chunky là những phụ kiện không thể thiếu trong tủ đồ mùa Xuân. Chúng không chỉ là điểm nhấn mà còn thể hiện cá tính riêng của người phối đồ.

## Kết Luận

Mùa Xuân 2026 là mùa của sự tự do thể hiện bản thân qua thời trang. Hãy thoải mái mix & match và tìm ra phong cách riêng phù hợp nhất với bạn.
    `,
  },
  {
    id: 2,
    title: "BÍ QUYẾT PHỐI ĐỒ CÔNG SỞ THANH LỊCH",
    excerpt: "Gợi ý 5 set đồ công sở thanh lịch tôn dáng giúp bạn tự tin toả sáng tại văn phòng.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    date: "05 Tháng 03, 2026",
    category: "Phong cách",
    readTime: "4 phút đọc",
    author: "John Henry",
    content: `
Phong cách công sở không nhất thiết phải nhàm chán hay đơn điệu. Với một vài bí quyết nhỏ, bạn hoàn toàn có thể biến trang phục văn phòng trở nên thanh lịch và thời thượng hơn.

## Set 1: Blazer + Quần Âu Ống Rộng

Chiếc blazer oversize kết hợp cùng quần âu ống rộng là công thức kinh điển và chưa bao giờ lỗi mốt. Chọn tông màu trung tính như be, xám hoặc navy cho vẻ chuyên nghiệp.

## Set 2: Sơ Mi Trắng + Chân Váy Midi

Không gì cổ điển hơn một chiếc sơ mi trắng tinh khôi kết hợp chân váy midi ôm sát. Thêm một chiếc thắt lưng da mảnh để tạo điểm nhấn ở eo.

## Set 3: Áo Blouse + Quần Tây

Áo blouse với chi tiết cổ nơ hoặc tay phồng nhẹ kết hợp cùng quần tây dáng suông mang đến vẻ nữ tính mà vẫn thanh lịch.

## Set 4: Đầm Suông Công Sở

Đầm suông dáng chữ A dài ngang gối là lựa chọn an toàn và tiện lợi. Chỉ cần khoác thêm một chiếc blazer mỏng là bạn đã sẵn sàng cho mọi cuộc họp.

## Set 5: Vest + Quần Culottes

Phong cách power dressing với vest kết hợp quần culottes tạo nên vẻ ngoài mạnh mẽ, tự tin nhưng vẫn không kém phần nữ tính.

## Lời Khuyên

Hãy luôn đầu tư vào những item cơ bản chất lượng tốt. Chúng có thể phối được với nhiều outfit khác nhau, giúp bạn tiết kiệm thời gian lựa chọn mỗi sáng.
    `,
  },
  {
    id: 3,
    title: "HƯỚNG DẪN BẢO QUẢN QUẦN ÁO ĐÚNG CÁCH",
    excerpt: "Bảo vệ và duy trì độ bền của những thiết kế hàng hiệu.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
    date: "01 Tháng 03, 2026",
    category: "Mẹo hay",
    readTime: "6 phút đọc",
    author: "John Henry",
    content: `
Việc bảo quản quần áo đúng cách không chỉ giúp kéo dài tuổi thọ của trang phục mà còn giữ cho chúng luôn như mới. Dưới đây là những mẹo bảo quản hiệu quả nhất.

## Phân Loại Trước Khi Giặt

Luôn phân loại quần áo theo màu sắc và chất liệu trước khi giặt. Quần áo sáng màu giặt riêng với đồ tối màu để tránh phai màu.

## Đọc Kỹ Nhãn Hướng Dẫn

Mỗi loại vải đều có yêu cầu giặt ủi khác nhau. Hãy kiểm tra nhãn hướng dẫn trên quần áo trước khi giặt để tránh làm hỏng chất liệu.

## Giặt Với Nước Lạnh

Nước lạnh giúp bảo vệ màu sắc và co giãn vải. Chỉ sử dụng nước nóng cho đồ trắng hoặc đồ cần khử khuẩn sâu.

## Phơi Đúng Cách

Tránh phơi quần áo dưới ánh nắng trực tiếp quá lâu, đặc biệt là đồ có màu sắc. Lật mặt trong ra ngoài khi phơi để bảo vệ bề mặt vải.

## Bảo Quản Trong Tủ

Sử dụng móc áo phù hợp cho từng loại quần áo. Áo khoác vest nên treo trên móc gỗ rộng vai, áo thun nên gấp để tránh giãn.

## Xử Lý Vết Bẩn Ngay

Khi bị dính bẩn, hãy xử lý ngay lập tức. Càng để lâu, vết bẩn càng khó tẩy sạch.
    `,
  },
  {
    id: 4,
    title: "BỘ SƯU TẬP MÙA HÈ – NĂNG ĐỘNG & PHÓNG KHOÁNG",
    excerpt: "Khám phá bộ sưu tập mùa Hè với những thiết kế trẻ trung, năng động.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop",
    date: "25 Tháng 02, 2026",
    category: "Bộ sưu tập",
    readTime: "5 phút đọc",
    author: "John Henry",
    content: `
Mùa Hè luôn là thời điểm tuyệt vời để thể hiện phong cách cá nhân với những thiết kế thoáng mát, năng động. Bộ sưu tập mùa Hè 2026 của John Henry mang đến nhiều lựa chọn phong phú.

## Concept: Tự Do & Phóng Khoáng

Lấy cảm hứng từ những chuyến road trip và bãi biển nhiệt đới, bộ sưu tập tập trung vào sự thoải mái và tự do.

## Chất Liệu Mùa Hè

Linen, cotton và rayon là ba chất liệu chủ đạo. Nhẹ nhàng, thoáng khí và thấm hút mồ hôi tốt – hoàn hảo cho thời tiết nóng bức.

## Gam Màu Nổi Bật

Bên cạnh những tông trung tính luôn an toàn, mùa Hè năm nay nổi bật với cam san hô, xanh ocean và vàng sunshine – những màu sắc tạo cảm giác vui tươi, tràn đầy năng lượng.

## Item Must-Have

- **Áo Hawaiian**: Họa tiết tropical sống động
- **Quần short linen**: Thoáng mát, dễ phối
- **Đầm maxi**: Nhẹ nhàng, bay bổng
- **Sandal da**: Thoải mái và phong cách
    `,
  },
  {
    id: 5,
    title: "PHONG CÁCH MINIMALIST – ÍT MÀ CHẤT",
    excerpt: "Triết lý \"Less is more\" trong thời trang.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200&auto=format&fit=crop",
    date: "20 Tháng 02, 2026",
    category: "Phong cách",
    readTime: "7 phút đọc",
    author: "John Henry",
    content: `
Minimalism – phong cách tối giản – không chỉ là một xu hướng nhất thời mà đã trở thành triết lý sống và ăn mặc của rất nhiều người yêu thời trang trên thế giới.

## Capsule Wardrobe Là Gì?

Capsule wardrobe là khái niệm tủ đồ với số lượng item tối thiểu nhưng có thể phối được tối đa các outfit khác nhau. Thông thường, một capsule wardrobe gồm 30-40 item cơ bản.

## Những Item Cốt Lõi

- **Áo thun trắng**: Simple nhưng không bao giờ sai
- **Jeans xanh đậm**: Phối được mọi thứ
- **Blazer đen**: Từ công sở đến dạo phố
- **Giày trắng**: Clean và versatile
- **Áo sơ mi Oxford**: Classic mọi thời đại

## Nguyên Tắc Phối Đồ Minimalist

1. **Tông màu trung tính**: Đen, trắng, xám, be, navy
2. **Tối đa 3 màu**: Trong một outfit
3. **Chất liệu tốt**: Ít nhưng chất
4. **Form chuẩn**: Không quá rộng, không quá chật

## Lợi Ích Của Minimalism

Ngoài việc tiết kiệm thời gian chọn đồ mỗi sáng, phong cách tối giản còn giúp bạn đầu tư thông minh hơn vào những item thực sự chất lượng và bền đẹp theo thời gian.
    `,
  },
  {
    id: 6,
    title: "CÁCH CHỌN VEST PHÙ HỢP VỚI DÁNG NGƯỜI",
    excerpt: "Hướng dẫn chi tiết cách chọn kiểu vest phù hợp.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
    date: "15 Tháng 02, 2026",
    category: "Mẹo hay",
    readTime: "8 phút đọc",
    author: "John Henry",
    content: `
Vest là trang phục thể hiện đẳng cấp và phong cách của phái mạnh. Tuy nhiên, không phải ai cũng biết cách chọn vest phù hợp với vóc dáng của mình.

## Vest Cho Người Cao Gầy

Nên chọn vest có vai rộng hơn (padded shoulders) và form regular fit. Họa tiết kẻ ngang sẽ giúp tạo cảm giác đầy đặn hơn. Tránh vest quá ôm sát.

## Vest Cho Người Thấp Nhỏ

Chọn vest ngắn vừa, phom slim fit. Nên chọn fabric trơn hoặc kẻ sọc dọc nhỏ để kéo dài thị giác. Tránh vest double-breasted vì sẽ tạo cảm giác nặng nề.

## Vest Cho Người To Con

Vest single-breasted 2 nút là lựa chọn an toàn nhất. Chọn chất liệu mỏng, nhẹ có độ rơi tốt. Tránh màu sáng và họa tiết lớn.

## Quy Tắc Chung

1. **Vai vest**: Phải vừa khít vai, không rộng không hẹp
2. **Ngực**: Có thể luồn một nắm tay khi cài nút
3. **Tay áo**: Để lộ 1-2cm tay sơ mi
4. **Chiều dài**: Phủ kín mông nhưng không quá dài

## Chất Liệu Vest

- **Wool**: Cổ điển, bốn mùa
- **Linen**: Mùa hè, thoáng mát
- **Cotton**: Casual, nhẹ nhàng
- **Velvet**: Sự kiện đặc biệt
    `,
  },
];

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);

  const post = useMemo(() => BLOG_POSTS.find((p) => p.id === postId), [postId]);

  // Bài viết liên quan (cùng danh mục, trừ bài hiện tại)
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return BLOG_POSTS.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 2);
  }, [post]);

  if (!post) {
    return (
      <div className="bg-[#111] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Không tìm thấy bài viết</h1>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#b91c1c] hover:text-red-400 uppercase tracking-widest transition-colors">
            Quay lại tin tức <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  /* Chuyển markdown đơn giản thành HTML */
  const renderContent = (raw: string) => {
    return raw
      .trim()
      .split("\n")
      .map((line, idx) => {
        const trimmed = line.trimStart();
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg md:text-xl font-black text-white uppercase tracking-[0.08em] mt-10 mb-4">
              {trimmed.replace("## ", "")}
            </h2>
          );
        }
        if (trimmed.startsWith("- **")) {
          const match = trimmed.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
          if (match) {
            return (
              <li key={idx} className="flex items-start gap-2 mb-2 text-sm text-gray-400 leading-relaxed ml-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] mt-2 flex-shrink-0" />
                <span><strong className="text-white">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ""}</span>
              </li>
            );
          }
        }
        if (/^\d+\.\s\*\*/.test(trimmed)) {
          const match = trimmed.match(/\d+\.\s\*\*(.+?)\*\*:?\s*(.*)/);
          if (match) {
            return (
              <li key={idx} className="flex items-start gap-2 mb-2 text-sm text-gray-400 leading-relaxed ml-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 mt-2 flex-shrink-0" />
                <span><strong className="text-white">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ""}</span>
              </li>
            );
          }
        }
        if (trimmed === "") {
          return <div key={idx} className="h-4" />;
        }
        return (
          <p key={idx} className="text-[15px] text-gray-400 leading-[1.9] mb-1">
            {trimmed}
          </p>
        );
      });
  };

  return (
    <div className="bg-[#111] w-full min-h-screen">
      {/* ── Hero Banner ── */}
      <section className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('${post.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-black/50 to-black/30" />
        <div className="relative z-10 flex flex-col justify-end h-full max-w-4xl mx-auto px-4 sm:px-6 pb-10">
          <span className="text-[10px] font-black text-[#b91c1c] uppercase tracking-[0.2em] mb-3">
            {post.category}
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-[0.1em] leading-snug mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Calendar size={12} />{post.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Clock size={12} />{post.readTime}</span>
            <span>•</span>
            <span>Bởi {post.author}</span>
          </div>
        </div>
      </section>

      {/* ── Nội dung bài viết ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-widest mb-10">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <ChevronRight size={10} />
          <Link href="/blog" className="hover:text-white transition-colors">Tin tức</Link>
          <ChevronRight size={10} />
          <span className="text-gray-300 truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Bài viết */}
        <article className="mb-16">
          {renderContent(post.content)}
        </article>

        {/* Chia sẻ */}
        <div className="border-t border-b border-white/10 py-6 mb-12 flex items-center justify-between">
          <span className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Chia sẻ bài viết</span>
          <div className="flex gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-[#1877F2] hover:text-white transition-all">
              <Facebook size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/20 hover:text-white transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Bài viết liên quan */}
        {relatedPosts.length > 0 && (
          <section>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.15em] mb-8">Bài viết liên quan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rp) => (
                <Link href={`/blog/${rp.id}`} key={rp.id} className="group">
                  <article className="flex gap-4 bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all p-4">
                    <div
                      className="w-24 h-24 rounded-lg bg-cover bg-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url('${rp.image}')` }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-[#b91c1c] uppercase tracking-[0.15em]">{rp.category}</span>
                      <h4 className="text-xs font-black text-white uppercase tracking-[0.05em] leading-relaxed mt-1 line-clamp-2 group-hover:text-gray-300 transition-colors">
                        {rp.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 mt-2 block">{rp.date}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Nút quay lại */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[11px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Quay lại trang tin tức
          </Link>
        </div>
      </div>
    </div>
  );
}
