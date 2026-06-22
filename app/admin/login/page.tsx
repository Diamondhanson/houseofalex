"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Boxes, KeyRound, Loader2, Mail } from "lucide-react";
import { sendAdminOtp, verifyAdminOtp } from "./actions";

type Step = "email" | "code";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await sendAdminOtp(email);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setStep("code");
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await verifyAdminOtp(email, code);
    if (!res.ok) {
      setPending(false);
      setError(res.error ?? "Invalid or expired code.");
      return;
    }
    // Session cookie is set - go to the dashboard.
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to storefront
        </Link>

        <div className="border border-slate-200 bg-white p-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center bg-red-600 text-white">
              <Boxes className="h-5 w-5" />
            </span>
            <div className="leading-none">
              <div className="text-sm font-bold text-slate-900">House of Alex</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600">
                Admin Console
              </div>
            </div>
          </div>

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="mt-7">
              <h1 className="text-lg font-bold text-slate-900">Sign in</h1>
              <p className="mt-1 text-sm text-slate-500">
                Enter your admin email and we&apos;ll send you a one-time code.
              </p>
              <label className="mt-5 block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@your-domain.com"
                    className="w-full border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </label>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Send code
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="mt-7">
              <h1 className="text-lg font-bold text-slate-900">Enter your code</h1>
              <p className="mt-1 text-sm text-slate-500">
                If <span className="font-medium text-slate-700">{email}</span> is an admin
                account, a 6-digit code is on its way.
              </p>
              <label className="mt-5 block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  One-time code
                </span>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-center text-lg font-semibold tracking-[0.3em] text-slate-900 placeholder:tracking-normal placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </label>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={pending}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verify & sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
                className="mt-3 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Trade-only admin access · authorized accounts only
        </p>
      </div>
    </div>
  );
}
