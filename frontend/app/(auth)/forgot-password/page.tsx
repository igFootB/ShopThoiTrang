"use client";

import Link from "next/link";
import { useState } from "react";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { Mail, ArrowLeft, Check, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setToast(null);
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (error) {
      const message =
        (error as AxiosError<{ message?: string }>)?.response?.data?.message ??
        "Có lỗi xảy ra. Vui lòng thử lại sau.";
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
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop')` }}
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
          <p className="text-white/80 text-xs uppercase tracking-[0.3em] mb-2 font-bold">Đừng lo lắng</p>
          <h2 className="text-white text-2xl font-black uppercase tracking-[0.1em] leading-relaxed">
            Chúng tôi sẽ giúp bạn<br/>lấy lại mật khẩu.
          </h2>
        </div>
      </div>

      {/* ── Bên phải: Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="text-white font-serif font-black text-2xl tracking-widest uppercase">
              JOHN HENRY
            </Link>
          </div>

          {/* Nút quay lại */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[11px] text-gray-500 hover:text-white uppercase tracking-widest font-bold transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Quay lại đăng nhập
          </Link>

          {!success ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-xl font-black text-white uppercase tracking-[0.15em] mb-2">
                  Khôi phục mật khẩu
                </h1>
                <p className="text-sm text-gray-500">
                  Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
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

                {/* Error */}
                {toast && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                    {toast}
                  </div>
                )}

                {/* Nút gửi */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full h-12 flex items-center justify-center gap-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${
                    submitting
                      ? "bg-white/10 text-gray-500 cursor-not-allowed"
                      : "bg-[#b91c1c] text-white hover:bg-[#991b1b] active:scale-[0.98]"
                  }`}
                >
                  {submitting ? "Đang gửi..." : (
                    <>
                      <Send size={16} /> Gửi yêu cầu
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── Trạng thái thành công ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-[0.1em] mb-3">
                Đã gửi email!
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <span className="text-white font-bold">{email}</span>. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam).
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          )}

          {/* Đường kẻ */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">hoặc</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Link đăng ký */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-bold text-white hover:text-[#b91c1c] transition-colors">
                Tạo tài khoản
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
