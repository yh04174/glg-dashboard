import { createClient } from "@/lib/supabase/server";

export type UserStatus = "pending" | "approved" | "rejected";
export type UserRole = "viewer" | "editor" | "admin";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  role: UserRole;
  requestedAt: string;
}

// 로그인 여부와 무관하게 null을 반환할 수 있음 — 호출부에서 리다이렉트 여부를 결정
export async function getCurrentAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("app_users")
    .select("id, email, name, avatar_url, status, role, requested_at")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatar_url,
    status: data.status,
    role: data.role,
    requestedAt: data.requested_at,
  };
}

export function canEdit(user: AppUser | null): boolean {
  return !!user && user.status === "approved" && (user.role === "editor" || user.role === "admin");
}
