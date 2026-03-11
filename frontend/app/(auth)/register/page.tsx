"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, User, Phone, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [ten, setTen] = useState("");
  const [email, setEmail] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setToast(null);
      setSuccess(null);

      const response = await api.post<{ message?: string }>("/auth/register", {
        ten,
        email,
        soDienThoai,
        matKhau,
      });

      setSuccess(response.data.message ?? "Đăng ký thành công! Đang chuyển sang đăng nhập...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      const message =
        (error as AxiosError<{ message?: string }>)?.response?.data?.message ??
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      setToast(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#111]">

      {/* ── Bên trái: Ảnh fashion ── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111]/80" />
        <div className="absolute inset-0 bg-black/30" />

        {/* Logo */}
        <div className="absolute top-10 left-10 z-10">
          <Link href="/" className="text-white font-serif font-black text-2xl tracking-widest uppercase">
            JOHN HENRY
          </Link>
        </div>

        {/* Slogan */}
        <div className="absolute bottom-12 left-10 right-10 z-10">
          <p className="text-white/80 text-xs uppercase tracking-[0.3em] mb-2 font-bold">Gia nhập cùng chúng tôi</p>
          <h2 className="text-white text-2xl font-black uppercase tracking-[0.1em] leading-relaxed">
            Khám phá phong cách<br/>thời trang đích thực.
          </h2>
        </div>
      </div>

      {/* ── Bên phải: Form đăng ký ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="text-white font-serif font-black text-2xl tracking-widest uppercase">
              JOHN HENRY
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-black text-white uppercase tracking-[0.15em] mb-2">
              Tạo tài khoản
            </h1>
            <p className="text-sm text-gray-500">
              Đăng ký để trải nghiệm mua sắm thời trang đẳng cấp.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Họ tên */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Họ tên
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ten}
                  onChange={(e) => setTen(e.target.value)}
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-3 pl-11 pr-4 focus:outline-none focus:border-white/30 placeholder:text-gray-600 transition-colors"
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-3 pl-11 pr-4 focus:outline-none focus:border-white/30 placeholder:text-gray-600 transition-colors"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  placeholder="0901 234 567"
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-3 pl-11 pr-4 focus:outline-none focus:border-white/30 placeholder:text-gray-600 transition-colors"
                />
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white py-3 pl-11 pr-12 focus:outline-none focus:border-white/30 placeholder:text-gray-600 transition-colors"
                />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {toast && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {toast}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
                <Check size={16} /> {success}
              </div>
            )}

            {/* Nút đăng ký */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full h-12 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${
                submitting
                  ? "bg-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-[#b91c1c] text-white hover:bg-[#991b1b] active:scale-[0.98]"
              }`}
            >
              {submitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          {/* Đường kẻ */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">hoặc</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Link đăng nhập */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-bold text-white hover:text-[#b91c1c] transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
