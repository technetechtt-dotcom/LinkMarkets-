import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { parsePlatforms } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { EnquiryForm } from "@/components/enquiry-form";
import { ReportForm } from "@/components/report-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true } } },
  });
  if (!listing || listing.status === "REMOVED") notFound();

  const platforms = parsePlatforms(listing.platforms);
  const canEnquire =
    !!session?.user &&
    listing.status === "ACTIVE" &&
    listing.ownerId !== session.user.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm font-bold text-[var(--blue)]">
        ← Back to browse
      </Link>
      <div className="mt-4 overflow-hidden rounded-[17px] border border-[var(--line)]">
        <div className="h-64 bg-slate-100">
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.imageUrl} alt={listing.make} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-6xl">
              {listing.kind === "car" ? "🚗" : "🏍️"}
            </div>
          )}
        </div>
        <div className="p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--blue)]">
            {listing.kind === "car" ? "E-hailing car" : "Delivery motorcycle"} · {listing.status}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold">
            {listing.make}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {listing.city}, {listing.province} · Listed by {listing.owner.name}
          </p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-extrabold">
            R {listing.price.toLocaleString("en-ZA")}{" "}
            <span className="text-sm font-medium text-[var(--muted)]">/ {listing.period}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {platforms.map((p) => (
              <span key={p} className="pill">
                {p}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed">{listing.description}</p>
          <div className="tip mt-4">
            Platform names indicate intended use, not endorsement by those companies.
            Confirm eligibility, insurance and contract terms before renting.
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {canEnquire ? (
          <EnquiryForm listingId={listing.id} />
        ) : !session?.user ? (
          <p className="text-sm">
            <Link href="/login" className="font-bold text-[var(--blue)]">
              Sign in
            </Link>{" "}
            to contact the owner.
          </p>
        ) : null}
        {session?.user && (
          <ReportForm targetType="LISTING" targetId={listing.id} />
        )}
      </div>
    </div>
  );
}
