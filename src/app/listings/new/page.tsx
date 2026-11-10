"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS, PROVINCES } from "@/lib/constants";

export default function NewListingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onUpload(file: File) {
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setImageUrl(data.url);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const platforms = form.getAll("platforms").map(String);
    const payload = {
      kind: String(form.get("kind")),
      make: String(form.get("make")),
      city: String(form.get("city")),
      province: String(form.get("province")),
      price: Number(form.get("price")),
      period: String(form.get("period")),
      platforms,
      description: String(form.get("description")),
      phone: String(form.get("phone")),
      imageUrl,
    };
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create listing");
      return;
    }
    router.push(`/listings/${data.listing.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
        List a vehicle
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        New listings go to admin review (PENDING) before appearing publicly, unless you are an admin.
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label>Vehicle type</label>
          <select name="kind" required defaultValue="motorcycle">
            <option value="motorcycle">Motorcycle</option>
            <option value="car">Car</option>
          </select>
        </div>
        <div className="field">
          <label>Make & model</label>
          <input name="make" required maxLength={80} />
        </div>
        <div className="field">
          <label>City</label>
          <input name="city" required maxLength={60} />
        </div>
        <div className="field">
          <label>Province</label>
          <select name="province" required>
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Price (ZAR)</label>
          <input name="price" type="number" min={1} required />
        </div>
        <div className="field">
          <label>Period</label>
          <select name="period" defaultValue="week">
            <option value="day">Per day</option>
            <option value="week">Per week</option>
            <option value="month">Per month</option>
          </select>
        </div>
        <div className="field sm:col-span-2">
          <label>Contact phone</label>
          <input name="phone" required maxLength={25} />
        </div>
        <div className="field sm:col-span-2">
          <label>Platforms</label>
          <div className="flex flex-wrap gap-3 pt-1">
            {PLATFORMS.map((p) => (
              <label key={p} className="text-xs font-semibold">
                <input type="checkbox" name="platforms" value={p} className="mr-1" />
                {p}
              </label>
            ))}
          </div>
        </div>
        <div className="field sm:col-span-2">
          <label>Photo upload</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file);
            }}
          />
          {uploading && <p className="text-xs text-[var(--muted)]">Uploading...</p>}
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Uploaded" className="mt-2 h-40 rounded-lg object-cover" />
          )}
        </div>
        <div className="field sm:col-span-2">
          <label>Description</label>
          <textarea name="description" required rows={4} minLength={10} maxLength={1000} />
        </div>
        {error && <p className="sm:col-span-2 text-sm font-semibold text-red-600">{error}</p>}
        <button className="btn btn-primary sm:col-span-2" disabled={loading || uploading}>
          {loading ? "Saving..." : "Submit listing"}
        </button>
      </form>
    </div>
  );
}
