import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Khám Phá Cấu Trúc Trái Đất 3D & Mảng Kiến Tạo",
  description:
    "Trang web giáo dục tương tác 3D: Khám phá các tầng sâu bên trong Trái Đất và quan sát các mảng kiến tạo cùng động đất thực tế từ USGS.",
  keywords: [
    "Trái Đất 3D",
    "Cấu trúc Trái Đất",
    "Manti",
    "Lõi Trái Đất",
    "Mảng kiến tạo",
    "Động đất USGS",
    "Địa chất học sinh",
  ],
  authors: [{ name: "Earth 3D Education" }],
  openGraph: {
    title: "Khám Phá Cấu Trúc Trái Đất 3D & Mảng Kiến Tạo",
    description:
      "Mô hình 3D tương tác các tầng sâu Trái Đất và địa cầu mảng kiến tạo kèm động đất trực tiếp.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#090d16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#07090e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
