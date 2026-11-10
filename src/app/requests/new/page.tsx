"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS, PROVINCES } from "@/lib/constants";

export default function NewRequestPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const budgetRaw = String(form.get("budgetMax") || "").trim();
    const payload = {
      kind: String(form.get("kind")),
      city: String(form.get("city")),
      province: String(form.get("province")),
      budgetMax: budgetRaw ? Number(budgetRaw) : null,
      period: String(form.get("period")),
      platforms: form.getAll("platforms").map(String),
      details: String(form.get("details")),
    };
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create request");
      return;
    }
    router.push(`/requests/${data.request.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
        Request a vehicle
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Can&apos;t find a matching bike or car? Post what you need so owners can offer one.
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label>Looking for</label>
          <select name="kind" defaultValue="motorcycle">
            <option value="motorcycle">Motorcycle</option>
            <option value="car">Car</option>
            <option value="either">Either</option>
          </select>
        </div>
        <div className="field">
          <label>Period</label>
          <select name="period" defaultValue="week">
            <option value="day">Per day</option>
            <option value="week">Per week</option>
            <option value="month">Per month</option>
          </select>
        </div>
        <div className="field">
          <label>City</label>
          <input name="city" required />
        </div>
        <div className="field">
          <label>Province</label>
          <select name="province" required>
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="field sm:col-span-2">
          <label>Max budget (ZAR, optional)</label>
          <input name="budgetMax" type="number" min={1} />
        </div>
        <div className="field sm:col-span-2">
          <label>Platforms</label>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => (
              <label key={p} className="text-xs font-semibold">
                <input type="checkbox" name="platforms" value={p} className="mr-1" />
                {p}
              </label>
            ))}
          </div>
        </div>
        <div className="field sm:col-span-2">
          <label>Details</label>
          <textarea
            name="details"
            required
            rows={4}
            minLength={10}
            placeholder="When you need it, deposit comfort, licence status, etc."
          />
        </div>
        {error && <p className="sm:col-span-2 text-sm font-semibold text-red-600">{error}</p>}
        <button className="btn btn-primary sm:col-span-2" disabled={loading}>
          {loading ? "Posting..." : "Post rental request"}
        </button>
      </form>
    </div>
  );
}
