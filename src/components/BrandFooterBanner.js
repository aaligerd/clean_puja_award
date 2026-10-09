import Image from "next/image";

export default function BrandFooterBanner() {
  return (
    <section className="relative bg-gradient-to-b from-[#470010] via-[#5c0018] to-[#3a000d] border-t border-amber-500/25 py-12 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        {/* White circular Ei Samay logo badge */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-2xl border-2 border-amber-400/50 hover:scale-105 transition-transform duration-300">
          <Image
            src="/brand-icon.png"
            alt="এই সময় অনলাইন"
            width={96}
            height={96}
            className="w-full h-full object-cover scale-130"
            priority
          />
        </div>

        {/* Clickable Pujor Somoy Text Logo */}
        <a
          href="https://eisamay.com/pujor-samay-2026"
          className="mt-4 mb-5 inline-block hover:scale-105 transition-transform duration-300 focus:outline-none"
        >
          <div className="relative h-10 sm:h-14 md:h-16 w-48 sm:w-64 md:w-72">
            <Image
              src="https://images.assettype.com/eisamay/2026-09-16/0196j8pk/text-logo.png"
              alt="পূজোর সময়"
              fill
              sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 288px"
              className="object-contain"
              priority
            />
          </div>
        </a>

        {/* Social Media Circular Outlined Icons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/eisamay.digital/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-300/60 hover:border-amber-300 text-amber-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 shadow"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* X (formerly Twitter) */}
          <a
            href="https://x.com/Ei_Samay"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-300/60 hover:border-amber-300 text-amber-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 shadow"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/ei-samay/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-300/60 hover:border-amber-300 text-amber-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 shadow"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@EiSamayonline"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-300/60 hover:border-amber-300 text-amber-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 shadow"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/eisamay.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-amber-300/60 hover:border-amber-300 text-amber-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 shadow"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/>
            </svg>
          </a>
        </div>

        {/* Footer Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-y-2 text-xs sm:text-sm font-semibold text-[#ffd200]">
          <a
            href="https://eisamay.com/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors px-2 py-0.5"
          >
            About Us
          </a>
          <span className="text-amber-300/40 select-none">|</span>
          <a
            href="https://eisamay.com/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors px-2 py-0.5"
          >
            Contact Us
          </a>
          <span className="text-amber-300/40 select-none">|</span>
          <a
            href="https://eisamay.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors px-2 py-0.5"
          >
            Privacy Policy
          </a>
          <span className="text-amber-300/40 select-none">|</span>
          <a
            href="https://eisamay.com/terms-and-condition"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors px-2 py-0.5"
          >
            Terms and Conditions
          </a>
          <span className="text-amber-300/40 select-none">|</span>
          <a
            href="https://eisamay.com/editorial-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors px-2 py-0.5"
          >
            Editorial Policy
          </a>
        </nav>
      </div>
    </section>
  );
}
