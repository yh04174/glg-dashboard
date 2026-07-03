"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
      <div className="bg-white rounded-xl shadow-sm border border-black/5 p-10 text-center space-y-4 w-96">
        <div className="text-xl font-semibold text-[#0B1F3A]">GLG Console</div>
        <p className="text-sm text-[#0B1F3A]/60">
          구글 계정으로 로그인 후 관리자 승인을 받으면 접속할 수 있습니다.
        </p>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#0B1F3A] text-white text-sm py-2.5 rounded-lg hover:bg-[#0B1F3A]/90 disabled:opacity-50"
        >
          {loading ? "이동 중..." : "Google 계정으로 로그인"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
