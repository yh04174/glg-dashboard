"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "대시보드" },
  { href: "/entities", label: "법인 관리" },
  { href: "/orgchart", label: "조직도" },
  { href: "/grademapping", label: "Grade 매핑" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-[#0B1F3A] text-white min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="text-lg font-semibold tracking-tight">GLG Console</div>
        <div className="text-xs text-white/50 mt-1">Global Grade Matrix</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-[11px] text-white/30 border-t border-white/10">
        Phase 1 · Draft data
      </div>
    </aside>
  );
}
