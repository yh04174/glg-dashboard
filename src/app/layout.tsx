import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Sidebar from "@/components/Sidebar";

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
      <body className="min-h-full bg-[#F4F6FA] text-[#0B1F3A] font-sans">
        <StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
