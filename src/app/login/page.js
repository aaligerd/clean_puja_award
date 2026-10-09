"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("দয়া করে ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন।");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড পরীক্ষা করুন।");
      } else {
        if (data.isAdmin || data.redirect === '/admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("সার্ভারের সাথে সংযোগ করা যায়নি। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-[#4a0011] border-b border-amber-500/25 py-3.5 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white border border-amber-400/40 shadow flex items-center justify-center">
              <Image
                src="/brand-icon.png"
                alt="এই সময় লোগো"
                width={40}
                height={40}
                className="w-full h-full object-cover scale-135"
                priority
              />
            </div>
            <div className="relative h-7 w-28">
              <Image
                src="https://images.assettype.com/eisamay/2026-09-16/0196j8pk/text-logo.png"
                alt="পূজোর সময়"
                fill
                sizes="112px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm text-rose-200 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <span>← মূল পাতায় ফিরে যান</span>
          </Link>
        </div>
      </header>

      {/* Login Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="puja-card p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            {/* Top Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
                <span>কমিটি ড্যাশবোর্ড এক্সেস</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                কমিটি <span className="text-[#ffc72c]">লগইন</span>
              </h1>
              <p className="text-rose-200/80 text-xs sm:text-sm mt-1.5">
                আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl mb-5 text-xs sm:text-sm bg-red-950/90 border border-red-400/50 text-rose-200 flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-rose-100 mb-1.5">
                  নিবন্ধিত ইমেইল (User ID) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="উদাঃ committee@gmail.com"
                  className="w-full bg-[#3b000f]/80 border border-amber-500/30 rounded-lg px-4 py-2.5 text-white placeholder-rose-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-semibold text-rose-100">
                    লগইন পাসওয়ার্ড <span className="text-amber-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    className="w-full bg-[#3b000f]/80 border border-amber-500/30 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-rose-300/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300 hover:text-amber-300 text-xs"
                    tabIndex={-1}
                  >
                    {showPassword ? "লুকান" : "দেখুন"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gold w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-red-950" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>যাচাই করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>লগইন করুন</span>
                      <span className="text-lg">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Link to Register */}
            <div className="mt-6 pt-5 border-t border-amber-500/20 text-center text-xs text-rose-200/80">
              <span>আপনার পূজা কমিটি এখনও নিবন্ধিত হয়নি? </span>
              <Link href="/#register" className="text-amber-300 hover:underline font-bold">
                এখানে রেজিস্টার করুন
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#38000c] border-t border-amber-500/20 py-4 px-4 text-center text-xs text-rose-200/60">
        © ২০২৬ ক্লিন পূজা অ্যাওয়ার্ড | সর্বস্বত্ব সংরক্ষিত
      </footer>
    </div>
  );
}
