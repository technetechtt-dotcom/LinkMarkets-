import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { parsePlatforms } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { RequestReplyForm } from "@/components/request-reply-form";
import { ReportForm } from "@/components/report-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const item = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true } },
      replies: {
        include: { owner: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!item) notFound();

  const canReply =
    !!session?.user &&
    (session.user.canListVehicles ||
      session.user.role === "OWNER" ||
      session.user.role === "ADMIN") &&
    item.status === "OPEN";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/requests" className="text-sm font-bold text-[var(--blue)]">
        ← All requests
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-extrabold">
        Looking for {item.kind} in {item.city}
      </h1>
      <p className="text-sm text-[var(--muted)]">
        {item.province} · {item.requester.name} · {item.status}
      </p>
      {item.budgetMax && (
        <p className="mt-2 font-extrabold">
          Budget up to R {item.budgetMax.toLocaleString("en-ZA")} / {item.period}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {parsePlatforms(item.platforms).map((p) => (
          <span key={p} className="pill">
            {p}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed">{item.details}</p>

      <h2 className="mt-8 font-[family-name:var(--font-display)] text-xl font-extrabold">
        Owner replies
      </h2>
      <div className="mt-3 space-y-3">
        {item.replies.map((r) => (
          <div key={r.id} className="rounded-xl border border-[var(--line)] p-4">
            <p className="text-sm font-bold">{r.owner.name}</p>
            <p className="mt-1 text-sm">{r.message}</p>
          </div>
        ))}
        {!item.replies.length && (
          <p className="text-sm text-[var(--muted)]">No replies yet.</p>
        )}
      </div>

      {canReply && <div className="mt-6"><RequestReplyForm requestId={item.id} /></div>}
      {session?.user && (
        <div className="mt-6">
          <ReportForm targetType="REQUEST" targetId={item.id} />
        </div>
      )}
    </div>
  );
}
