"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PLATFORMS } from "@/lib/constants";

type ListingCard = {
  id: string;
  kind: string;
  make: string;
  city: string;
  province: string;
  price: number;
  period: string;
  platforms: string[];
  imageUrl: string | null;
  ownerName: string;
};

export function BrowseClient({ initial }: { initial: ListingCard[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [platform, setPlatform] = useState("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return initial.filter((l) => {
      if (kind !== "all" && l.kind !== kind) return false;
      if (platform !== "all" && !l.platforms.includes(platform)) return false;
      if (!query) return true;
      const hay = [l.make, l.city, l.province, l.ownerName, ...l.platforms]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [initial, q, kind, platform]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="-mt-8 grid gap-3 rounded-[15px] border border-[var(--line)] bg-white p-4 shadow-[0_15px_45px_rgba(20,37,56,0.06)] md:grid-cols-[1.2fr_1fr_1fr_auto]">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="City, model, owner..."
          />
        </div>
        <div className="field">
          <label htmlFor="kind">Vehicle type</label>
          <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All vehicles</option>
            <option value="motorcycle">Motorcycles</option>
            <option value="car">Cars</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="platform">Work platform</label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="all">Any platform</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary self-end">
          Search
        </button>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
            Available for rent
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {filtered.length} active listing{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/requests/new" className="btn">
          Can&apos;t find one? Request →
        </Link>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => (
          <article key={l.id} className="card flex flex-col">
            <div className="relative h-44 bg-slate-100">
              {l.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.imageUrl} alt={l.make} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-5xl">
                  {l.kind === "car" ? "🚗" : "🏍️"}
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-[11px] font-extrabold">
                {l.city}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--blue)]">
                {l.kind === "car" ? "E-hailing car" : "Delivery motorcycle"}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-extrabold">
                {l.make}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {l.city}, {l.province} · {l.ownerName}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {l.platforms.slice(0, 3).map((p) => (
                  <span key={p} className="pill">
                    {p}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-3">
                <p className="font-[family-name:var(--font-display)] text-xl font-extrabold">
                  R {l.price.toLocaleString("en-ZA")}{" "}
                  <span className="text-xs font-medium text-[var(--muted)]">/ {l.period}</span>
                </p>
                <Link href={`/listings/${l.id}`} className="btn btn-dark">
                  View →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!filtered.length && (
        <div className="mt-6 rounded-[15px] border border-dashed border-slate-300 p-10 text-center text-[var(--muted)]">
          <p className="font-bold text-[var(--ink)]">No vehicles found</p>
          <p className="mt-2 text-sm">
            Post a rental request so owners can offer a matching bike or car.
          </p>
          <Link href="/requests/new" className="btn btn-primary mt-4 inline-flex">
            + Request a vehicle
          </Link>
        </div>
      )}
    </section>
  );
}
