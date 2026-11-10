"use client";

import { FormEvent, useState } from "react";

export function ReportForm({
  targetType,
  targetId,
}: {
  targetType: "LISTING" | "REQUEST" | "USER" | "ENQUIRY";
  targetId: string;
}) {
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType,
        targetId,
        reason: String(form.get("reason")),
        details: String(form.get("details") || ""),
      }),
    });
    const data = await res.json();
    setStatus(res.ok ? "Report submitted to admins." : data.error || "Failed");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[17px] border border-dashed border-slate-300 p-4">
      <h3 className="text-sm font-extrabold">Report abuse</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="reason">Reason</label>
          <input id="reason" name="reason" required maxLength={120} placeholder="Spam, scam, unsafe..." />
        </div>
        <div className="field">
          <label htmlFor="details">Details</label>
          <input id="details" name="details" maxLength={1000} />
        </div>
      </div>
      <button className="btn mt-3" type="submit">
        Submit report
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </form>
  );
}
