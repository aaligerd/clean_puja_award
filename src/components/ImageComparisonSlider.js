"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

export default function ImageComparisonSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Section Heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-400/30 px-3.5 py-1 rounded-full text-amber-300 text-xs sm:text-sm font-medium mb-3">
          <span>প্যান্ডেল পরিচ্ছন্নতা তুলনা (Before vs After)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
          উৎসবের আলো থেকে <span className="text-[#ffc72c]">পরিচ্ছন্নতার আদর্শ</span>
        </h2>
        <p className="text-rose-200/80 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          মাঝের গোল্ডেন স্লাইডারটি ডানে বা বাঁয়ে টেনে দেখুন পূজা চলাকালীন ও পরবর্তী পরিচ্ছন্নতার বাস্তব চিত্র।
        </p>
      </div>

      {/* Top Dual Status Indicators */}
      <div className="flex items-center justify-between max-w-lg mx-auto mb-4 px-2 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setSliderPosition(100)}
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 border ${
            sliderPosition > 50
              ? "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm shadow-amber-500/20"
              : "bg-black/30 text-rose-200/60 border-transparent hover:text-white"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>পূজা চলাকালীন (Before)</span>
        </button>

        <button
          onClick={() => setSliderPosition(0)}
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 border ${
            sliderPosition < 50
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm shadow-emerald-500/20"
              : "bg-black/30 text-rose-200/60 border-transparent hover:text-white"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>পূজা পরবর্তী (After)</span>
        </button>
      </div>

      {/* Comparison Container with Chalchitra Frame */}
      <div className="chalchitra-border p-2 sm:p-3 relative shadow-2xl overflow-hidden group">
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onClick={(e) => handleMove(e.clientX)}
          className="relative w-full aspect-[16/9] rounded-xl overflow-hidden select-none cursor-ew-resize"
        >
          {/* AFTER Image Layer (Clipped to only appear on the right side of the slider) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <Image
              src="/images/after.png"
              alt="পূজা পরবর্তী পরিচ্ছন্ন প্যান্ডেল এলাকা (After Puja)"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover object-center pointer-events-none"
            />
            {/* After Label Badge: Only visible when After section is wide enough */}
            {sliderPosition <= 80 && (
              <div className="absolute bottom-4 right-4 z-10 bg-emerald-950/90 backdrop-blur-md border border-emerald-400/70 text-emerald-200 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 pointer-events-none transition-opacity duration-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>পূজা পরবর্তী (পরিচ্ছন্ন)</span>
              </div>
            )}
          </div>

          {/* BEFORE Image Layer (Clipped to only appear on the left side of the slider) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <Image
              src="/images/before.png"
              alt="পূজা চলাকালীন প্যান্ডেল (During Puja)"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover object-center pointer-events-none"
            />
            {/* Before Label Badge: Only visible when Before section is wide enough */}
            {sliderPosition >= 20 && (
              <div className="absolute bottom-4 left-4 z-10 bg-red-950/90 backdrop-blur-md border border-amber-400/70 text-amber-200 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 pointer-events-none transition-opacity duration-200">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>পূজা চলাকালীন</span>
              </div>
            )}
          </div>

          {/* Vertical Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-500 shadow-[0_0_15px_rgba(255,199,44,0.9)] pointer-events-none z-30"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          >
            {/* Circular Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 border-2 border-white shadow-2xl flex items-center justify-center text-red-950 transition-transform group-hover:scale-110 active:scale-95">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
