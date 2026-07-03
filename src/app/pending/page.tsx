import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function PendingPage() {
  const user = await getCurrentAppUser();

  if (!user) redirect("/login");
  if (user.status === "approved") redirect("/");

  const message =
    user.status === "rejected"
      ? "접근 요청이 거부되었습니다. 관리자에게 문의해주세요."
      : "관리자 승인 대기 중입니다. 승인되면 다시 접속해주세요.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
      <div className="bg-white rounded-xl shadow-sm border border-black/5 p-10 text-center space-y-4 w-96">
        <div className="text-xl font-semibold text-[#0B1F3A]">GLG Console</div>
        <p className="text-sm text-[#0B1F3A]/60">
          {user.email} 계정으로 로그인됨
        </p>
        <p className="text-sm text-[#0B1F3A]">{message}</p>
        <SignOutButton />
      </div>
    </div>
  );
}
