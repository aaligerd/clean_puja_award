import Link from "next/link";
import Image from "next/image";
import HighlightsCarousel from "@/components/HighlightsCarousel";
import ImageComparisonSlider from "@/components/ImageComparisonSlider";
import RegistrationForm from "@/components/RegistrationForm";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Brand Navbar (Ei Samay / Pujor Somoy inspired) */}
      <header className="bg-[#4a0011] border-b border-amber-500/25 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* <button className="text-white hover:text-amber-400 transition-colors p-1" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button> */}
            
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Brand Logo (Ei Samay) */}
              <div className="relative w-14 h-14 sm:w-9 sm:h-9 shrink-0 rounded-full overflow-hidden bg-white/10 p-0.5 border border-amber-400/40">
                <Image
                  src="https://images.assettype.com/eisamay/2026-09-14/9yn8yftt/es-logo.png"
                  alt="এই সময় লোগো"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>

              {/* Pujor Somoy Text Logo */}
              {/* <div className="relative h-7 sm:h-8 w-24 sm:w-32">
                <Image
                  src="https://images.assettype.com/eisamay/2026-09-16/0196j8pk/text-logo.png"
                  alt="পূজোর সময়"
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-contain object-left"
                  priority
                />
              </div> */}

              <span className="hidden lg:inline-block text-lg bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-medium">
                ক্লিন পূজা অ্যাওয়ার্ড
              </span>
            </Link>
          </div>

          {/* <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-rose-100">
            <a href="#about" className="hover:text-amber-300 transition-colors">অ্যাওয়ার্ড সম্পর্কে</a>
            <a href="#criteria" className="hover:text-amber-300 transition-colors">পরিচ্ছন্নতার মানদণ্ড</a>
            <a href="#timeline" className="hover:text-amber-300 transition-colors">সময়সীমা</a>
            <a href="#register" className="hover:text-amber-300 transition-colors">রেজিস্ট্রেশন</a>
          </nav> */}

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm text-amber-300 hover:text-white px-3 py-1.5 border border-amber-400/40 rounded-full transition-colors"
            >
              কমিটি লগইন
            </Link>
            <a
              href="#register"
              className="btn-gold text-xs sm:text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <span>রেজিস্টার করুন</span>
              <span className="text-base leading-none">→</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Bengali Chalchitra Motif */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        {/* Background decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-400/30 px-4 py-1.5 rounded-full mb-6 text-amber-300 text-lg font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>ক্লিন পূজা সম্মাননা ২০২৬</span>
          </div> */}

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            আপনার পূজাকে দিন <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">পরিচ্ছন্নতার শীর্ষ সম্মান</span>
          </h1>

          <p className="text-rose-100/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            দুর্গাপূজা চলাকালীন ও বিসর্জনের পরে আপনার প্যান্ডেল চত্বর পরিচ্ছন্ন রাখুন, ছবি আপলোড করুন এবং জিতে নিন শ্রেষ্ঠ ক্লিন পূজা অ্যাওয়ার্ড।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#register"
              className="btn-gold text-base sm:text-lg px-8 py-3 rounded-full flex items-center gap-2 shadow-lg"
            >
              <span>কমিটি নাম নথিভুক্ত করুন</span>
              <span className="text-xl leading-none">→</span>
            </a>
            <a
              href="#about"
              className="puja-card text-white hover:bg-white/10 px-6 py-3 rounded-full text-base font-semibold transition-all border border-amber-500/30"
            >
              নিয়মাবলী জানুন
            </a>
          </div>
        </div>
      </section>

      {/* Before / After Image Comparison Section */}
      <ImageComparisonSlider />

      {/* Key Highlights / Chalchitra Style Cards */}
      <section id="about" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#ffc72c] flex items-center gap-2">
              <span>মূল ধাপ ও নিয়মাবলী</span>
            </h2>
            <p className="text-rose-200/80 text-sm mt-1">সহজ ৪টি ধাপে অংশগ্রহণ করুন</p>
          </div>
        </div>

        <HighlightsCarousel />
      </section>

      {/* Registration Form Section */}
      <RegistrationForm />

      {/* Footer */}
      <footer className="bg-[#38000c] border-t border-amber-500/20 py-8 px-4 text-center text-sm text-rose-200/70 mt-auto">
        <p className="font-medium text-rose-100">
          © ২০২৬ ক্লিন পূজা অ্যাওয়ার্ড | সর্বস্বত্ব সংরক্ষিত
        </p>
        <p className="text-xs text-rose-200/50 mt-1">
          একটি পরিবেশবান্ধব ও পরিচ্ছন্ন সমাজ গঠনে যৌথ উদ্যোগ
        </p>
      </footer>
    </div>
  );
}
