import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { parsePlatforms } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { OwnerListingActions } from "@/components/owner-listing-actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const [listings, requests, enquiriesReceived, enquiriesSent] = await Promise.all([
    prisma.listing.findMany({
      where: { ownerId: userId, NOT: { status: "REMOVED" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enquiry.findMany({
      where: { listing: { ownerId: userId } },
      include: {
        fromUser: { select: { name: true, phone: true, email: true } },
        listing: { select: { make: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.enquiry.findMany({
      where: { fromUserId: userId },
      include: { listing: { select: { make: true, id: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Signed in as {session.user.name} · {session.user.role}
        {session.user.canListVehicles ? " · can list vehicles" : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/requests/new" className="btn btn-primary">
          + Request a vehicle
        </Link>
        {(session.user.canListVehicles ||
          session.user.role === "OWNER" ||
          session.user.role === "ADMIN") && (
          <Link href="/listings/new" className="btn">
            + List a vehicle
          </Link>
        )}
        {session.user.role === "ADMIN" && (
          <Link href="/admin" className="btn btn-dark">
            Admin console
          </Link>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold">My listings</h2>
        <div className="mt-3 space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="rounded-xl border border-[var(--line)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/listings/${l.id}`} className="font-bold hover:text-[var(--blue)]">
                    {l.make}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    {l.city} · R {l.price.toLocaleString("en-ZA")} / {l.period} · {l.status}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {parsePlatforms(l.platforms).map((p) => (
                      <span key={p} className="pill">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <OwnerListingActions id={l.id} status={l.status} />
              </div>
            </div>
          ))}
          {!listings.length && (
            <p className="text-sm text-[var(--muted)]">No listings yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-extrabold">My rental requests</h2>
        <div className="mt-3 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-xl border border-[var(--line)] p-4">
              <Link href={`/requests/${r.id}`} className="font-bold hover:text-[var(--blue)]">
                {r.kind} in {r.city}
              </Link>
              <p className="text-xs text-[var(--muted)]">{r.status}</p>
            </div>
          ))}
          {!requests.length && (
            <p className="text-sm text-[var(--muted)]">No requests yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-extrabold">Enquiries received</h2>
          <div className="mt-3 space-y-3">
            {enquiriesReceived.map((e) => (
              <div key={e.id} className="rounded-xl border border-[var(--line)] p-4 text-sm">
                <p className="font-bold">
                  {e.fromUser.name} → {e.listing.make}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {e.fromUser.phone} · {e.fromUser.email}
                  {e.notifiedAt ? " · notified" : ""}
                </p>
                <p className="mt-1">{e.message}</p>
              </div>
            ))}
            {!enquiriesReceived.length && (
              <p className="text-sm text-[var(--muted)]">None yet.</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Enquiries I sent</h2>
          <div className="mt-3 space-y-3">
            {enquiriesSent.map((e) => (
              <div key={e.id} className="rounded-xl border border-[var(--line)] p-4 text-sm">
                <Link href={`/listings/${e.listing.id}`} className="font-bold">
                  {e.listing.make}
                </Link>
                <p className="mt-1">{e.message}</p>
              </div>
            ))}
            {!enquiriesSent.length && (
              <p className="text-sm text-[var(--muted)]">None yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
