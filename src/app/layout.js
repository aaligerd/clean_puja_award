import localFont from "next/font/local";
import "./globals.css";

const samayFont = localFont({
  src: [
    {
      path: "../fonts/4CSamayUni Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/4CSamayUni.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/4CSamayUniBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/4CSamayUniExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-4c-samay",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0980-09FF, U+0964-0965, U+200C-200D, U+25CC",
    },
  ],
});

export const metadata = {
  title: "ক্লিন পূজা অ্যাওয়ার্ড | Clean Puja Award",
  description: "দুর্গাপূজা কমিটিদের পরিবেশ সচেতনতা ও পরিচ্ছন্নতা সম্মাননা পোর্টাল",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${samayFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-400 selection:text-red-950">
        {children}
      </body>
    </html>
  );
}
