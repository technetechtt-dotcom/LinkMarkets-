"use client";

import { FormEvent, useState } from "react";

export function EnquiryForm({ listingId }: { listingId: string }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        message: String(form.get("message")),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setStatus(data.error || "Failed to send enquiry");
      return;
    }
    setStatus(
      data.notified
        ? "Enquiry sent — owner has been notified."
        : "Enquiry saved. Owner notification queued/logged.",
    );
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[17px] border border-[var(--line)] p-5">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold">
        Contact owner
      </h2>
      <div className="field mt-3">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          minLength={10}
          maxLength={1200}
          defaultValue="Hi, is this vehicle still available for rent? Please share the rental requirements."
        />
      </div>
      <button className="btn btn-primary mt-3" disabled={loading}>
        {loading ? "Sending..." : "Send enquiry"}
      </button>
      {status && <p className="mt-2 text-sm font-semibold text-[var(--green)]">{status}</p>}
    </form>
  );
}
