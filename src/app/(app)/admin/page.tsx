import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AdminUserRow from "./AdminUserRow";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  status: "pending" | "approved" | "rejected";
  role: "viewer" | "editor" | "admin";
  requested_at: string;
  approved_at: string | null;
  last_login_at: string | null;
}

export default async function AdminPage() {
  const me = await getCurrentAppUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("app_users")
    .select("id, email, name, status, role, requested_at, approved_at, last_login_at")
    .order("requested_at", { ascending: false });

  const users = (data ?? []) as UserRow[];
  const pending = users.filter((u) => u.status === "pending");
  const others = users.filter((u) => u.status !== "pending");

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">계정 관리</h1>
        <p className="text-sm text-[#0B1F3A]/60 mt-1">
          접속을 요청한 계정을 승인/거부하고, 편집 권한을 부여할 수 있습니다.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6">
        <h2 className="font-semibold mb-4">승인 대기 ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="text-sm text-[#0B1F3A]/40 py-4">대기 중인 요청이 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {pending.map((u) => (
              <AdminUserRow key={u.id} user={u} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-black/5 shadow-sm p-6">
        <h2 className="font-semibold mb-4">전체 계정 ({others.length})</h2>
        {others.length === 0 ? (
          <div className="text-sm text-[#0B1F3A]/40 py-4">등록된 계정이 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {others.map((u) => (
              <AdminUserRow key={u.id} user={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
