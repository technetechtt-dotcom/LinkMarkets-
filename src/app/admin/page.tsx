import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminConsole } from "@/components/admin-console";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
        Admin moderation
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Approve listings, review abuse reports, suspend users.
      </p>
      <AdminConsole />
    </div>
  );
}
