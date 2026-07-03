import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth";
import { AuthUserProvider } from "@/lib/authContext";
import { StoreProvider } from "@/lib/store";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAppUser();

  if (!user) redirect("/login");
  if (user.status !== "approved") redirect("/pending");

  let pendingCount = 0;
  if (user.role === "admin") {
    const supabase = await createClient();
    const { count } = await supabase
      .from("app_users")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pendingCount = count ?? 0;
  }

  return (
    <AuthUserProvider user={user}>
      <StoreProvider user={user}>
        <div className="flex min-h-screen">
          <Sidebar user={user} pendingCount={pendingCount} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </StoreProvider>
    </AuthUserProvider>
  );
}
