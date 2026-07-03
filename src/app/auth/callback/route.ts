import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 최초 로그인 시 app_users 행을 만들고(관리자 이메일이면 자동 승인),
      // 기존 사용자면 최근 로그인 시각만 갱신하는 DB 함수 호출
      await supabase.rpc("self_register");
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
