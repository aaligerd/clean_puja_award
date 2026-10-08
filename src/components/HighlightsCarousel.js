"use client";

import { useRef, useState, useEffect } from "react";

const steps = [
  {
    step: "১",
    title: "রেজিস্ট্রেশন",
    subtitle: "কমিটি নথিভুক্তকরণ",
    desc: "অনলাইনে মাত্র ২ মিনিটে ফর্ম পূরণ করুন। স্বয়ংক্রিয়ভাবে ইউজার আইডি ও পাসওয়ার্ড চলে যাবে আপনার ইমেইলে।",
    icon: (
      <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    step: "২",
    title: "পূজা চলাকালীন ফটো",
    subtitle: "উৎসবের দিনগুলি",
    desc: "উৎসবের দিনগুলিতে প্যান্ডেল, প্রবেশদ্বার এবং সংলগ্ন রাস্তার পরিচ্ছন্নতার সর্বোচ্চ ১০টি ভালো মানের ছবি আপলোড করুন।",
    icon: (
      <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    step: "৩",
    title: "পূজা পরবর্তী ফটো",
    subtitle: "বিসর্জনের পর পরিচ্ছন্নতা",
    desc: "বিসর্জন সমাপ্ত হওয়ার পর প্যান্ডেল সংলগ্ন এলাকা সম্পূর্ণ পরিষ্কার-পরিচ্ছন্ন করার সর্বোচ্চ ১০টি ছবি আপলোড করুন।",
    icon: (
      <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    step: "৪",
    title: "বিচার ও পুরস্কার",
    subtitle: "জুরি মূল্যায়ন",
    desc: "বিশেষজ্ঞ জুরি মণ্ডলী উভয় পর্যায়ের ছবি পুঙ্খানুপুঙ্খ যাচাই করে সেরা পরিবেশবান্ধব ও পরিচ্ছন্ন পূজা কমিটিদের পুরস্কৃত করবেন।",
    icon: (
      <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

export default function HighlightsCarousel() {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

    // Calculate active dot based on scroll position
    const cardWidth = el.firstElementChild?.clientWidth || 1;
    const gap = 16;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(Math.max(index, 0), steps.length - 1));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability);
    return () => {
      el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  const scroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth || 280;
    const scrollAmount = direction === "left" ? -(cardWidth + 16) : cardWidth + 16;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollToIndex = (index) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth || 280;
    el.scrollTo({ left: index * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <div className="relative w-full">
      {/* Navigation Arrows for Mobile & Tablet (matching the circular white arrows in reference image) */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        aria-label="Previous Slide"
        className={`md:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white text-gray-900 shadow-xl flex items-center justify-center transition-all border border-amber-300 ${
          canScrollLeft
            ? "opacity-95 hover:scale-110 active:scale-95"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        aria-label="Next Slide"
        className={`md:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white text-gray-900 shadow-xl flex items-center justify-center transition-all border border-amber-300 ${
          canScrollRight
            ? "opacity-95 hover:scale-110 active:scale-95"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Cards Container: Snap Carousel on Mobile, Grid on Desktop */}
      <div
        ref={scrollContainerRef}
        className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth pb-4 md:pb-0 px-2 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="w-[82vw] sm:w-[320px] md:w-auto shrink-0 snap-center chalchitra-border p-6 flex flex-col items-center text-center relative group hover:border-amber-400 transition-all duration-300"
          >
            {/* Ornamental Chalchitra Arch SVG Accent */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 opacity-40 pointer-events-none">
              <svg viewBox="0 0 100 20" className="w-full h-full text-amber-400 fill-current">
                <path d="M0,20 Q25,0 50,0 Q75,0 100,20 Z" />
              </svg>
            </div>

            {/* Step Number Badge with Golden Glow */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400/25 to-red-950/80 border-2 border-amber-400/70 flex items-center justify-center text-amber-300 font-extrabold text-2xl mb-4 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
              {item.step}
            </div>

            {/* Icon & Subtitle */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium mb-2">
              {item.subtitle}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2.5 tracking-tight group-hover:text-amber-200 transition-colors">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-rose-100/85 text-sm leading-relaxed font-normal">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Indicator Dots (Mobile Only) */}
      <div className="flex md:hidden justify-center items-center gap-2 mt-2">
        {steps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              activeIndex === idx
                ? "w-6 h-2 bg-gradient-to-r from-amber-400 to-yellow-300"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
