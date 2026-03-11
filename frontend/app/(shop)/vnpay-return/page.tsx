"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { useCart } from "@/components/providers/CartProvider";

function VNPayReturnContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const cleared = useRef(false);

  const responseCode = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef");
  const isSuccess = responseCode === "00";

  useEffect(() => {
    if (isSuccess && !cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [isSuccess, clearCart]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        {isSuccess ? (
          <>
            {/* Success icon */}
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
            <h1 className="text-2xl font-bold text-emerald-700">
              Thanh toan thanh cong!
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Giao dich <strong>{txnRef}</strong> da duoc xu ly thanh cong qua VNPay.
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
          </>
        ) : (
          <>
            {/* Error icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
              <svg
                className="h-10 w-10 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-rose-700">Thanh toan that bai</h1>
            <p className="mt-3 text-sm text-slate-600">
              Giao dich khong thanh cong (ma loi:{" "}
              <strong>{responseCode ?? "N/A"}</strong>). Vui long thu lai.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/checkout"
                className="rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Thu thanh toan lai
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ve trang chu
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
        </div>
      }
    >
      <VNPayReturnContent />
    </Suspense>
  );
}
