"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, ShoppingCart, User as UserIcon, Heart, Menu, X, ChevronDown } from "lucide-react";
import { useCart, type CartItem } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatVND } from "@/lib/utils";
import { api, publicCategoriesApi } from "@/lib/api";

type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string; }[];
};

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: "TRANG CHỦ", href: "/" },
  { label: "THỜI TRANG NAM", href: "/category/nam" },
  { label: "THỜI TRANG NỮ", href: "/category/nu" },
  { label: "TIN TỨC", href: "/blog" },
  { label: "CỬA HÀNG", href: "/stores" },
];

/* ─── Mock mini cart ─── */
const MOCK_MINI_CART: CartItem[] = [
  { id: 1, productId: 101, tenSanPham: "Áo Polo Nam Form Vừa Thoải Mái", hinhAnh: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=200&auto=format&fit=crop", gia: 450000, variantId: 2, size: "M", mauSac: "Trắng", soLuong: 1 },
  { id: 2, productId: 103, tenSanPham: "Quần Jeans Nam Dáng Suông", hinhAnh: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=200&auto=format&fit=crop", gia: 750000, variantId: 22, size: "30", mauSac: "Xanh đậm", soLuong: 1 },
];

function UserAccountBadge({ isAuthenticated, user, logout, isTransparent }: { isAuthenticated: boolean; user: any; logout: () => void, isTransparent?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hoverClass = isTransparent ? "hover:text-gray-600" : "hover:text-gray-300";

  if (!mounted) {
    return (
      <div className={`transition-colors cursor-pointer ${hoverClass}`}>
        <UserIcon size={22} className="stroke-[1.5]" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`group relative flex items-center h-full cursor-pointer transition-colors ${hoverClass}`}>
        <UserIcon size={22} className="stroke-[1.5]" />
        <div className="absolute right-0 top-full mt-4 hidden flex-col w-48 rounded-md bg-[#222222] py-2 shadow-2xl group-hover:flex z-50 border border-white/10 cursor-default">
          {/* Cầu nối (bridge) vô hình khoảng 24px để lấp đầy khoảng trống margin-top 16px, giữ hover state */}
          <div className="w-full h-6 bg-transparent absolute top-0 -translate-y-full" />

          <div className="px-4 py-2 border-b border-white/10 mb-1">
            <p className="text-xs text-gray-400">Xin chào,</p>
            <p className="text-sm font-semibold text-white truncate">{user.ten}</p>
          </div>
          {user.quyen === "ADMIN" && (
            <Link href="/dashboard" className="block px-4 py-2 text-sm text-[#b91c1c] font-semibold hover:text-white hover:bg-white/5 border-b border-white/10 pb-2 mb-1">
              Trang quản trị
            </Link>
          )}
          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">Tài khoản</Link>
          <Link href="/orders" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">Đơn hàng</Link>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 text-sm text-[#ff4d4f] hover:bg-white/5 w-full text-left mt-1 border-t border-white/10 pt-2"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link href="/login" className={`transition-colors ${hoverClass}`}>
      <UserIcon size={22} className="stroke-[1.5]" />
    </Link>
  );
}

export default function Navbar() {
  const { cartCount, cartItems, cartTotal, fetchCartItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [miniCartItems, setMiniCartItems] = useState<CartItem[]>([]);
  const [navLinks, setNavLinks] = useState<NavLink[]>(DEFAULT_NAV_LINKS);
  const [miniCartTotal, setMiniCartTotal] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Chỉ làm header trong suốt trên trang chủ
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Fetch mini cart khi mở */
  const loadMiniCart = useCallback(async () => {
    try {
      await fetchCartItems();
    } catch { /* ignore */ }
  }, [fetchCartItems]);

  useEffect(() => {
    if (isMiniCartOpen) {
      loadMiniCart();
    }
  }, [isMiniCartOpen, loadMiniCart]);

  // Fetch Danh mục để render menu động
  useEffect(() => {
    const fetchNavCategories = async () => {
      try {
        const res = await publicCategoriesApi.getCategories();
        const cats: any[] = res.data;
        
        const activeCats = cats.filter(c => c.trangThai === 1);

        const namChildren = activeCats.filter(c => c.gioiTinh === "NAM").map(c => ({
          label: c.tenDanhMuc,
          href: `/category/${c.id}`
        }));

        const nuChildren = activeCats.filter(c => c.gioiTinh === "NU").map(c => ({
          label: c.tenDanhMuc,
          href: `/category/${c.id}`
        }));
        
        const unisexChildren = activeCats.filter(c => c.gioiTinh === "UNISEX").map(c => ({
          label: c.tenDanhMuc,
          href: `/category/${c.id}`
        }));

        const dynamicLinks: NavLink[] = [
          { label: "TRANG CHỦ", href: "/" },
          { 
            label: "THỜI TRANG NAM", 
            href: "/category/nam",
            children: namChildren.length > 0 ? namChildren : undefined
          },
          { 
            label: "THỜI TRANG NỮ", 
            href: "/category/nu",
            children: nuChildren.length > 0 ? nuChildren : undefined
          },
        ];

        if (unisexChildren.length > 0) {
          dynamicLinks.push({
            label: "UNISEX",
            href: "/category/unisex",
            children: unisexChildren
          });
        }

        dynamicLinks.push({ label: "TIN TỨC", href: "/blog" });
        dynamicLinks.push({ label: "CỬA HÀNG", href: "/stores" });

        setNavLinks(dynamicLinks);
      } catch (error) {
        console.error("Lỗi khi tải danh mục cho Navbar:", error);
      }
    };

    fetchNavCategories();
  }, []);

  /* Sync data từ CartProvider hoặc fallback mock */
  useEffect(() => {
    if (cartItems.length > 0) {
      setMiniCartItems(cartItems);
      setMiniCartTotal(cartTotal);
    } else if (isMiniCartOpen) {
      setMiniCartItems(MOCK_MINI_CART);
      setMiniCartTotal(MOCK_MINI_CART.reduce((s, i) => s + i.gia * i.soLuong, 0));
    }
  }, [cartItems, cartTotal, isMiniCartOpen]);

  const handleRemoveItem = async (variantId: number, itemId: number) => {
    try {
      await api.delete(`/cart/remove/${variantId}`);
    } catch { /* ignore */ }
    setMiniCartItems((prev) => prev.filter((i) => i.id !== itemId));
    const removed = miniCartItems.find((i) => i.id === itemId);
    if (removed) setMiniCartTotal((prev) => prev - removed.gia * removed.soLuong);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  const isTransparent = isHomePage && !isScrolled;

  const headerBgClass = isTransparent 
    ? "bg-transparent shadow-none border-b-0"
    : "bg-[#111] shadow-lg";

  const promoOpacity = isTransparent ? "opacity-0 h-0 py-0 overflow-hidden" : "opacity-100 h-auto py-2";

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBgClass}`}>
        {/* Top Promo Bar */}
        <div className={`w-full bg-[#b91c1c] text-white text-[11px] md:text-xs font-semibold tracking-widest text-center px-4 uppercase transition-all duration-300 ${promoOpacity}`}>
          <p className="animate-pulse">FREESHIP TOÀN QUỐC CHO ĐƠN HÀNG TỪ 500K - ĐỔI TRẢ MIỄN PHÍ TRONG 30 NGÀY</p>
        </div>

        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-b ${isHomePage && !isScrolled ? "border-transparent" : "border-white/10"}`}>
          <div className="flex h-20 items-center justify-between">

            {/* Left: Mobile Menu Toggle / Logo */}
            <div className="flex items-center gap-4 lg:w-1/4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-1 transition-colors ${isTransparent ? "text-black hover:text-gray-600" : "text-white hover:text-gray-300"}`}
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>

              <Link href="/" className="flex items-center">
                <span className={`${isTransparent ? "text-black" : "text-white"} font-serif font-black text-2xl tracking-widest uppercase transition-colors`}>JOHN HENRY</span>
              </Link>
            </div>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden lg:flex flex-1 justify-center items-center gap-5 xl:gap-8 px-4 h-full">
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                return (
                  <div key={link.label} className="group flex items-center px-1 relative h-full">
                    <Link
                      href={link.href}
                      className={`relative py-1 text-sm font-bold uppercase tracking-[0.05em] xl:tracking-[0.1em] flex items-center gap-1 whitespace-nowrap transition-colors ${
                        isActive 
                          ? (isTransparent ? "text-black" : "text-white") 
                          : (isTransparent ? "text-gray-600 hover:text-black" : "text-gray-400 hover:text-white")
                      }`}
                    >
                      {link.label}
                      {link.children && <ChevronDown size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />}

                      <span
                        className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 ease-out bg-[#b91c1c] ${isActive ? "w-full" : "w-0 group-hover:w-full group-hover:bg-[#b91c1c]"
                          }`}
                      />
                    </Link>

                    {/* Dropdown Menu - Simple Menu */}
                    {link.children && (
                      <div className="absolute top-full left-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50 min-w-[220px]">
                        {/* Bridge */}
                        <div className="w-full h-4 bg-transparent absolute top-0 -translate-y-full" />
                        
                        <div className="bg-white border border-gray-100 mt-2 shadow-xl flex flex-col py-2 border-t-[3px] border-t-[#b91c1c]">
                          {link.children.map(child => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="px-6 py-3 text-[13px] font-bold text-gray-700 hover:text-white hover:bg-[#b91c1c] transition-colors uppercase tracking-[0.05em] whitespace-nowrap"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Icons */}
            <div className={`flex items-center justify-end gap-6 lg:w-1/4 ${isTransparent ? "text-black" : "text-white"}`}>

              {/* Search */}
              <div className="relative">
                {!isSearchOpen ? (
                  <button onClick={() => setIsSearchOpen(true)} className={`transition-colors ${isTransparent ? "hover:text-gray-600" : "hover:text-gray-300"}`}>
                    <Search size={22} className="stroke-[1.5]" />
                  </button>
                ) : (
                  <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 w-64 flex items-center bg-[#222] rounded-full px-4 border border-white/20">
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-sm text-white py-2 outline-none border-none"
                      onBlur={() => setIsSearchOpen(false)}
                    />
                    <button type="submit" className="text-gray-400">
                      <Search size={16} />
                    </button>
                  </form>
                )}
              </div>

              {/* User Account */}
              <UserAccountBadge isAuthenticated={isAuthenticated} user={user} logout={(...args) => { logout(...args); router.push("/login"); }} isTransparent={isTransparent} />

              <Link href="/wishlist" className={`transition-colors hidden sm:block ${isTransparent ? "hover:text-gray-600" : "hover:text-gray-300"}`}>
                <Heart size={22} className="stroke-[1.5]" />
              </Link>

              {/* ══ Cart Icon + Mini Cart Dropdown ══ */}
              <div className="relative">
                <button
                  onClick={() => setIsMiniCartOpen(!isMiniCartOpen)}
                  className={`transition-colors relative flex items-center ${isTransparent ? "hover:text-gray-600" : "hover:text-gray-300"}`}
                >
                  <ShoppingCart size={22} className="stroke-[1.5]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#111] border-t border-white/10 p-5 absolute w-full shadow-2xl z-50 h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="flex flex-col space-y-2">
              {navLinks.map(link => (
                <div key={link.label} className="border-b border-white/10 last:border-0 pb-2 mb-2">
                  <Link
                    href={link.href}
                    className="text-base font-bold text-white uppercase tracking-widest py-3 hover:text-gray-300 transition-colors flex justify-between items-center"
                    onClick={() => !link.children && setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={18} className="opacity-50" />}
                  </Link>

                  {link.children && (
                    <div className="pl-4 flex flex-col space-y-4 mt-2 mb-4 border-l-2 border-white/10 ml-2">
                      {link.children.map(child => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="text-sm font-semibold text-gray-400 uppercase tracking-wider hover:text-white"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════
         Mini Cart Overlay
       ══════════════════════════════════════ */}
      {isMiniCartOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsMiniCartOpen(false)} />

          {/* Panel trượt từ bên phải */}
          <div className="fixed right-0 top-0 h-full w-[360px] max-w-[90vw] bg-[#1a1a1a] z-[70] shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">Giỏ hàng</h3>
              <button onClick={() => setIsMiniCartOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {miniCartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart size={36} className="text-gray-600 mb-4" />
                  <p className="text-sm text-gray-500">Giỏ hàng trống</p>
                </div>
              ) : (
                miniCartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-white/5 last:border-0">
                    {/* Ảnh */}
                    <Link
                      href={`/product/${item.productId}`}
                      onClick={() => setIsMiniCartOpen(false)}
                      className="relative w-16 h-20 rounded-md overflow-hidden flex-shrink-0 bg-[#222]"
                    >
                      <Image src={item.hinhAnh} alt={item.tenSanPham} fill unoptimized className="object-cover" />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.productId}`}
                          onClick={() => setIsMiniCartOpen(false)}
                          className="text-xs font-bold text-white leading-relaxed line-clamp-2 hover:text-gray-300 transition-colors"
                        >
                          {item.tenSanPham}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.variantId, item.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                        {item.mauSac} / {item.size}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-gray-400 bg-white/5 rounded px-2 py-0.5">{item.soLuong}</span>
                        <span className="text-xs font-bold text-white">{formatVND(item.gia * item.soLuong)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {miniCartItems.length > 0 && (
              <div className="border-t border-white/10 px-5 py-4">
                {/* Tổng tiền */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng tiền:</span>
                  <span className="text-base font-black text-[#b91c1c]">{formatVND(miniCartTotal)}</span>
                </div>

                {/* 2 nút */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={() => setIsMiniCartOpen(false)}
                    className="flex items-center justify-center h-11 bg-[#b91c1c] text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-[#991b1b] transition-all"
                  >
                    Xem giỏ hàng
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsMiniCartOpen(false)}
                    className="flex items-center justify-center h-11 bg-[#b91c1c] text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-[#991b1b] transition-all"
                  >
                    Thanh toán
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Animation keyframe */}
      <style jsx global>{`
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    `}</style>
    </>
  );
}



