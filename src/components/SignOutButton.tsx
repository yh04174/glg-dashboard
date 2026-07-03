"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ className }: { className?: string }) {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleSignOut}
      className={className ?? "text-sm px-4 py-2 rounded-md border border-black/10 hover:bg-black/5"}
    >
      로그아웃
    </button>
  );
}
