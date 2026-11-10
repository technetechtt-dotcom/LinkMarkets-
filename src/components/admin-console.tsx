"use client";

import { useEffect, useState } from "react";

type AdminData = {
  stats: {
    listings: number;
    activeListings: number;
    openRequests: number;
    openReports: number;
    users: number;
  };
  pendingListings: Array<{
    id: string;
    make: string;
    city: string;
    owner: { name: string; email: string };
  }>;
  openReports: Array<{
    id: string;
    reason: string;
    targetType: string;
    targetId: string;
    reporter: { name: string; email: string };
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    suspended: boolean;
  }>;
};

export function AdminConsole() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/moderate");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to load");
      return;
    }
    setData(json);
  }

  useEffect(() => {
    void load();
  }, []);

  async function moderate(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Action failed");
      return;
    }
    await load();
  }

  if (error) return <p className="mt-6 text-red-600">{error}</p>;
  if (!data) return <p className="mt-6 text-sm text-[var(--muted)]">Loading...</p>;

  return (
    <div className="mt-8 space-y-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(data.stats).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-[var(--line)] p-4">
            <p className="text-2xl font-extrabold">{v}</p>
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{k}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-extrabold">Pending listings</h2>
        <div className="mt-3 space-y-3">
          {data.pendingListings.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="font-bold">{l.make}</p>
                <p className="text-xs text-[var(--muted)]">
                  {l.city} · {l.owner.name} ({l.owner.email})
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => moderate({ action: "approve_listing", listingId: l.id })}
                >
                  Approve
                </button>
                <button
                  className="btn"
                  onClick={() => moderate({ action: "reject_listing", listingId: l.id })}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {!data.pendingListings.length && (
            <p className="text-sm text-[var(--muted)]">No pending listings.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-extrabold">Open abuse reports</h2>
        <div className="mt-3 space-y-3">
          {data.openReports.map((r) => (
            <div key={r.id} className="rounded-xl border p-4">
              <p className="font-bold">
                {r.targetType} · {r.reason}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Target {r.targetId} · by {r.reporter.name}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  className="btn"
                  onClick={() =>
                    moderate({ action: "dismiss_report", reportId: r.id, note: "No action" })
                  }
                >
                  Dismiss
                </button>
                <button
                  className="btn btn-dark"
                  onClick={() =>
                    moderate({ action: "action_report", reportId: r.id, note: "Actioned" })
                  }
                >
                  Mark actioned
                </button>
              </div>
            </div>
          ))}
          {!data.openReports.length && (
            <p className="text-sm text-[var(--muted)]">No open reports.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-extrabold">Users</h2>
        <div className="mt-3 space-y-2">
          {data.users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm">
              <div>
                <p className="font-bold">
                  {u.name} · {u.role}
                  {u.suspended ? " · SUSPENDED" : ""}
                </p>
                <p className="text-xs text-[var(--muted)]">{u.email}</p>
              </div>
              <button
                className="btn"
                onClick={() =>
                  moderate({
                    action: u.suspended ? "unsuspend_user" : "suspend_user",
                    userId: u.id,
                  })
                }
              >
                {u.suspended ? "Unsuspend" : "Suspend"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
