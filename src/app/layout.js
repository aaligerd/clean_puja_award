import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const bengaliFont = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  display: "swap",
  variable: "--font-bengali",
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
    <html lang="bn" className={`${bengaliFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-400 selection:text-red-950">
        {children}
      </body>
    </html>
  );
}
