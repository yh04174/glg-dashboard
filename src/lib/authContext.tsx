"use client";

import React, { createContext, useContext } from "react";
import type { AppUser } from "@/lib/auth";

const AuthUserContext = createContext<AppUser | null>(null);

export function AuthUserProvider({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}

export function useAuthUser(): AppUser {
  const ctx = useContext(AuthUserContext);
  if (!ctx) throw new Error("useAuthUser must be used within AuthUserProvider");
  return ctx;
}

export function useCanEdit(): boolean {
  const user = useAuthUser();
  return user.role === "editor" || user.role === "admin";
}
