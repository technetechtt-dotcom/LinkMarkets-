import Link from "next/link";
import { parsePlatforms } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await prisma.rentalRequest.findMany({
    where: { status: "OPEN" },
    include: {
      requester: { select: { name: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
            Rental requests
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Drivers looking for a motorcycle or car. Owners can reply with an offer.
          </p>
        </div>
        <Link href="/requests/new" className="btn btn-primary">
          + Post request
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((r) => (
          <article key={r.id} className="card p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--blue)]">
              {r.kind === "either" ? "Bike or car" : r.kind}
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-extrabold">
              Needed in {r.city}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {r.province} · {r.requester.name} · {r._count.replies} replies
            </p>
            {r.budgetMax ? (
              <p className="mt-2 font-extrabold">
                Budget up to R {r.budgetMax.toLocaleString("en-ZA")} / {r.period}
              </p>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">Budget flexible · {r.period}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {parsePlatforms(r.platforms).slice(0, 3).map((p) => (
                <span key={p} className="pill">
                  {p}
                </span>
              ))}
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-slate-600">{r.details}</p>
            <Link href={`/requests/${r.id}`} className="btn btn-dark mt-4 inline-flex">
              View / reply →
            </Link>
          </article>
        ))}
      </div>

      {!requests.length && (
        <div className="mt-8 rounded-[15px] border border-dashed p-10 text-center text-[var(--muted)]">
          No open requests yet.{" "}
          <Link href="/requests/new" className="font-bold text-[var(--blue)]">
            Post the first one
          </Link>
          .
        </div>
      )}
    </div>
  );
}
