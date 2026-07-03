"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth";

// 실제 권한 검증은 Supabase RLS(is_admin())가 서버에서 최종적으로 강제한다.
// 여기서는 UI 흐름을 위해 실패 시 에러만 던진다.

export async function approveUser(id: string, role: UserRole) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("app_users")
    .update({ status: "approved", role, approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function rejectUser(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("app_users").update({ status: "rejected" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function setUserRole(id: string, role: UserRole) {
  const supabase = await createClient();
  const { error } = await supabase.from("app_users").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function revokeUser(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("app_users").update({ status: "rejected" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
