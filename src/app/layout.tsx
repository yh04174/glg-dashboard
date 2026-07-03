import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GLG Console — Global Grade Matrix",
  description: "법인별 조직도 및 Grade 표준화 관리 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-[#F4F6FA] text-[#0B1F3A] font-sans">{children}</body>
    </html>
  );
}
