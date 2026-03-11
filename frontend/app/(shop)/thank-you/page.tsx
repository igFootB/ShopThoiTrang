"use client";

import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        {/* checkmark circle */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-10 w-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Dat hang thanh cong!</h1>
        <p className="mt-3 text-sm text-slate-600">
          Cam on ban da mua hang. Don hang cua ban dang duoc xu ly. Chung toi se lien he
          som nhat co the.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/profile"
            className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Xem don hang cua toi
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ve trang chu
          </Link>
        </div>
      </div>
    </div>
  );
}
