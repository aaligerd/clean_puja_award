"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Invalid email or password. Please try again.");
        setIsLoading(false);
      } else {
        // Redirect to admin dashboard
        window.location.href = "/admin";
      }
    } catch {
      setErrorMsg("Unable to connect to server. Please try again.");
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setFormData({
      email: "admin@eisamay.com",
      password: "Admin@2026#Clean",
    });
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden bg-[#240008]">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white border border-amber-400/40 shadow flex items-center justify-center">
            <Image
              src="/brand-icon.png"
              alt="Ei Samay Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover scale-135"
              priority
            />
          </div>
          {/* <div className="relative h-8 w-32">
            <Image
              src="https://images.assettype.com/eisamay/2026-09-16/0196j8pk/text-logo.png"
              alt="Pujor Somoy"
              fill
              sizes="128px"
              className="object-contain object-left"
              priority
            />
          </div> */}

          <span className="hidden lg:inline-block text-lg bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-medium">
                ক্লিন পূজা অ্যাওয়ার্ড
              </span>
        </div>

        <Link
          href="/login"
          className="text-xs text-rose-200/80 hover:text-amber-300 transition-colors flex items-center gap-1"
        >
          <span>← Committee Portal</span>
        </Link>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center my-8">
        <div className="chalchitra-border p-8 sm:p-10 max-w-md w-full relative z-10 shadow-2xl bg-[#3b000f]/90">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-2xl mb-3 shadow-inner">
              🛡️
            </div>
            <h1 className="text-2xl font-black text-white">Admin Control Portal</h1>
            <p className="text-xs text-amber-200/80 mt-1 font-medium">
              Clean Puja Award 2026 Management & Jury Evaluation
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-950/90 border border-red-500/60 rounded-xl p-3.5 mb-5 text-rose-200 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1.5">
                Admin Email ID <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@eisamay.com"
                className="w-full bg-[#240008]/90 border border-amber-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-rose-300/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1.5">
                Password <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-[#240008]/90 border border-amber-500/30 rounded-xl px-4 py-2.5 pr-12 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-rose-300/40 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-rose-300 hover:text-amber-300 font-semibold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full py-3 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 cursor-pointer text-slate-950"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Access Admin Portal →</span>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-amber-500/20 text-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-amber-300/80 hover:text-amber-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-amber-400/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>🔑 Fill Default Admin Credentials</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-rose-200/50 py-3">
        © 2026 Clean Puja Award | Admin Management Console
      </footer>
    </div>
  );
}
