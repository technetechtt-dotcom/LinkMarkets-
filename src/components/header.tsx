"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Header() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--blue)] text-lg text-white">↗</span>
        <span>
          Fleet<span className="text-[var(--blue)]">Market</span>{" "}
          <span className="text-xs font-bold tracking-normal text-slate-400">SA</span>
        </span>
      </Link>
      <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 md:flex">
        <Link href="/">Browse</Link>
        <Link href="/requests">Requests</Link>
        <Link href="/privacy">Privacy</Link>
        {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
      </nav>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link href="/dashboard" className="btn">
              Dashboard
            </Link>
            {(user.canListVehicles || user.role === "OWNER" || user.role === "ADMIN") && (
              <Link href="/listings/new" className="btn btn-primary">
                + List vehicle
              </Link>
            )}
            <button type="button" className="btn" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
