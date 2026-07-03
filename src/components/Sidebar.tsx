"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppUser } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

const NAV = [
  { href: "/", label: "대시보드" },
  { href: "/entities", label: "법인 관리" },
  { href: "/orgchart", label: "조직도" },
  { href: "/grademapping", label: "Grade 매핑" },
];

const ROLE_LABEL: Record<AppUser["role"], string> = {
  viewer: "보기 전용",
  editor: "편집 가능",
  admin: "관리자",
};

export default function Sidebar({ user, pendingCount }: { user: AppUser; pendingCount: number }) {
  const pathname = usePathname();
  const nav = user.role === "admin" ? [...NAV, { href: "/admin", label: "계정 관리" }] : NAV;

  return (
    <aside className="w-60 shrink-0 bg-[#0B1F3A] text-white min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="text-lg font-semibold tracking-tight">GLG Console</div>
        <div className="text-xs text-white/50 mt-1">Global Grade Matrix</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              {item.href === "/admin" && pendingCount > 0 && (
                <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 space-y-2">
        <div className="text-xs text-white/70 truncate">{user.name || user.email}</div>
        <div className="text-[10px] text-white/40">{ROLE_LABEL[user.role]}</div>
        <SignOutButton className="text-xs text-white/50 hover:text-white/80" />
      </div>
    </aside>
  );
}
