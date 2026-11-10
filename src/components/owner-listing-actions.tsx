"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OwnerListingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "pause" | "activate" | "delete") {
    setBusy(true);
    if (action === "delete") {
      if (!confirm("Remove this listing?")) {
        setBusy(false);
        return;
      }
      await fetch(`/api/listings/${id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "ACTIVE" && (
        <button className="btn" disabled={busy} onClick={() => act("pause")}>
          Pause
        </button>
      )}
      {(status === "PAUSED" || status === "REJECTED") && (
        <button className="btn" disabled={busy} onClick={() => act("activate")}>
          Activate
        </button>
      )}
      <button className="btn" disabled={busy} onClick={() => act("delete")}>
        Delete
      </button>
    </div>
  );
}
