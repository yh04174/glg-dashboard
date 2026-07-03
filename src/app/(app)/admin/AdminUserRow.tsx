"use client";

import { useState, useTransition } from "react";
import { approveUser, rejectUser, setUserRole, revokeUser } from "./actions";
import type { UserRole } from "@/lib/auth";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  status: "pending" | "approved" | "rejected";
  role: UserRole;
  requested_at: string;
  approved_at: string | null;
  last_login_at: string | null;
}

const STATUS_LABEL: Record<UserRow["status"], string> = {
  pending: "대기 중",
  approved: "승인됨",
  rejected: "거부됨",
};

export default function AdminUserRow({ user }: { user: UserRow }) {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>(user.role);

  return (
    <div className="flex items-center justify-between border border-black/5 rounded-lg px-4 py-3 text-sm">
      <div>
        <div className="font-medium">{user.name || user.email}</div>
        <div className="text-xs text-[#0B1F3A]/50">{user.email}</div>
        <div className="text-[11px] text-[#0B1F3A]/40 mt-0.5">
          {STATUS_LABEL[user.status]} · 요청일 {new Date(user.requested_at).toLocaleDateString("ko-KR")}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={role}
          disabled={pending || user.role === "admin"}
          onChange={(ev) => {
            const next = ev.target.value as UserRole;
            setRole(next);
            if (user.status === "approved") {
              startTransition(() => setUserRole(user.id, next));
            }
          }}
          className="border border-black/10 rounded-md px-2 py-1.5 text-xs bg-white disabled:opacity-50"
        >
          <option value="viewer">보기 전용</option>
          <option value="editor">편집 가능</option>
          {user.role === "admin" && <option value="admin">관리자</option>}
        </select>

        {user.status === "pending" && (
          <>
            <button
              disabled={pending}
              onClick={() => startTransition(() => approveUser(user.id, role))}
              className="text-xs px-3 py-1.5 rounded-md bg-[#1E4E8C] text-white disabled:opacity-50"
            >
              승인
            </button>
            <button
              disabled={pending}
              onClick={() => startTransition(() => rejectUser(user.id))}
              className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-500 disabled:opacity-50"
            >
              거부
            </button>
          </>
        )}

        {user.status === "approved" && user.role !== "admin" && (
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(`${user.email} 계정의 접속 권한을 회수할까요?`)) {
                startTransition(() => revokeUser(user.id));
              }
            }}
            className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-500 disabled:opacity-50"
          >
            접속 회수
          </button>
        )}

        {user.status === "rejected" && (
          <button
            disabled={pending}
            onClick={() => startTransition(() => approveUser(user.id, role))}
            className="text-xs px-3 py-1.5 rounded-md bg-[#1E4E8C] text-white disabled:opacity-50"
          >
            재승인
          </button>
        )}
      </div>
    </div>
  );
}
