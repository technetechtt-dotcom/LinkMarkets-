import Link from "next/link";
import { parsePlatforms } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { BrowseClient } from "@/components/browse-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: { owner: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const payload = listings.map((l) => ({
    id: l.id,
    kind: l.kind,
    make: l.make,
    city: l.city,
    province: l.province,
    price: l.price,
    period: l.period,
    platforms: parsePlatforms(l.platforms),
    imageUrl: l.imageUrl,
    ownerName: l.owner.name,
  }));

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[23px] bg-[var(--navy)] px-6 py-12 text-white md:px-14 md:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[2px] text-[#82b5ff]">
            South Africa&apos;s driver-ready vehicle marketplace
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight md:text-5xl">
            Find a vehicle.
            <br />
            Get to work.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
            Rent delivery motorcycles and e-hailing cars from verified owners — or post a
            rental request if you cannot find what you need.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/requests/new" className="btn btn-primary">
              Request a vehicle
            </Link>
            <Link href="/register" className="btn bg-white/10 text-white border-white/20">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <BrowseClient initial={payload} />
    </div>
  );
}
