"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RequestReplyForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/requests/${requestId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: String(form.get("message")) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setStatus(data.error || "Failed");
      return;
    }
    setStatus(data.notified ? "Reply sent and rentee notified." : "Reply saved.");
    router.refresh();
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[17px] border border-[var(--line)] p-5">
      <h3 className="font-extrabold">Reply as owner</h3>
      <div className="field mt-3">
        <label htmlFor="message">Offer / message</label>
        <textarea id="message" name="message" required rows={4} minLength={10} />
      </div>
      <button className="btn btn-primary mt-3" disabled={loading}>
        {loading ? "Sending..." : "Send reply"}
      </button>
      {status && <p className="mt-2 text-sm font-semibold text-[var(--green)]">{status}</p>}
    </form>
  );
}
