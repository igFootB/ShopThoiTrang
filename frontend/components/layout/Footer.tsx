import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#111] text-white pt-16 pb-8 border-t border-white/10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* CỘT 1: COMPANY */}
          <div className="space-y-6">
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">VỀ JOHN HENRY</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Câu chuyện thương hiệu</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Tin tức & Sự kiện</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Tuyển dụng</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Hệ thống cửa hàng</Link></li>
            </ul>
          </div>

          {/* CỘT 2: POLICIES */}
          <div className="space-y-6">
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">CHÍNH SÁCH</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Chính sách giao hàng</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Chính sách thành viên</Link></li>
            </ul>
          </div>

          {/* CỘT 3: CUSTOMER CARE */}
          <div className="space-y-6">
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">CHĂM SÓC KHÁCH HÀNG</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>Hotline mua hàng: <a href="tel:0906954368" className="text-white hover:text-gray-300 transition-colors">0906 954 368</a></li>
              <li>Hotline CSKH: <a href="tel:0906954368" className="text-white hover:text-gray-300 transition-colors">0906 954 368</a></li>
              <li>Email: <a href="mailto:cskh@johnhenry.vn" className="text-white hover:text-gray-300 transition-colors">cskh@johnhenry.vn</a></li>
            </ul>
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Kết nối với chúng tôi</h4>
              <div className="flex gap-4 text-white">
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-all"><Youtube size={18} /></a>
              </div>
            </div>
          </div>

          {/* CỘT 4: NEWSLETTER */}
          <div className="space-y-6">
            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">ĐĂNG KÝ NHẬN TIN</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nhận thông tin cập nhật về sản phẩm mới, khuyến mãi và nhiều hơn nữa.
            </p>
            <form className="relative flex items-center mt-4">
              <input 
                type="email" 
                placeholder="Nhập email của bạn..." 
                className="w-full bg-transparent border-b border-white/20 text-sm text-white py-3 pr-10 focus:outline-none focus:border-white transition-colors"
                required
              />
              <button type="submit" className="absolute right-0 text-white hover:text-gray-400 transition-colors">
                GỬI
              </button>
            </form>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 tracking-[0.1em] uppercase">
          <p>© 2026 JOHN HENRY OFFICIAL. BẢN QUYỀN THUỘC VỀ JOHN HENRY.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Tích điểm</Link>
            <Link href="#" className="hover:text-white transition-colors">Khuyến mãi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
