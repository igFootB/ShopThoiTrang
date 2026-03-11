"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tổng quan", icon: "📊" },
  {
    label: "Quản lý Sản phẩm",
    icon: "📦",
    subItems: [
      { href: "/products", label: "Danh sách sản phẩm" },
      { href: "/products/categories", label: "Danh mục sản phẩm" },
    ],
  },
  { href: "/orders", label: "Quản lý Đơn hàng", icon: "🛒" },
  { href: "/payments", label: "Quản lý Thanh toán", icon: "💳" },
  { href: "/reviews", label: "Đánh giá sản phẩm", icon: "⭐" },
  { href: "/banners", label: "Quản lý Banner", icon: "🖼️" },
  { href: "/lookbooks", label: "Quản lý Lookbook", icon: "✨" },
  { href: "/accounts", label: "Quản lý Tài khoản", icon: "👥" },
  { href: "/vouchers", label: "Khuyến Mãi & Voucher", icon: "🎟️" },
];

function NavItem({
  item,
  pathname,
  setSidebarOpen,
}: {
  item: any;
  pathname: string;
  setSidebarOpen: (open: boolean) => void;
}) {
  const isDirectActive = pathname === item.href;
  const isParentActive = item.subItems?.some((sub: any) => pathname.startsWith(sub.href)) || false;

  // Mở dropdown mặc định nếu đang ở trang con
  const [isOpen, setIsOpen] = useState(isParentActive);

  if (item.subItems) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${isParentActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </div>
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="ml-9 mt-1 space-y-1 pl-2 border-l-2 border-gray-100">
            {item.subItems.map((sub: any) => {
              const isSubActive = pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${isSubActive
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  {sub.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isDirectActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      <span className="text-lg">{item.icon}</span>
      {item.label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && user.quyen !== "ADMIN") {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [isAuthenticated, user, router]);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* ── Sidebar ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
      >
        {/* Logo Area */}
        <div className="flex h-16 shrink-0 items-center justify-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <span className="text-sm font-bold">JH</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">Admin Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200">
          {NAV_ITEMS.map((item, idx) => (
            <NavItem
              key={item.label || idx}
              item={item}
              pathname={pathname}
              setSidebarOpen={setSidebarOpen}
            />
          ))}
        </nav>

        {/* Footer Area */}
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại Cửa hàng
          </Link>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 shadow-sm">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden lg:block">
            {/* Tùy chọn: Breadcrumbs hoặc Search bar có thể thêm ở đây */}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-900">{user?.ten ?? "Admin"}</span>
              <span className="text-xs text-gray-500">Quản trị viên</span>
            </div>

            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {user?.ten ? user.ten.charAt(0).toUpperCase() : "A"}
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Page Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
