"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { POPIA_VERSION } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      password: String(form.get("password")),
      role: String(form.get("role")),
      popiaConsent: form.get("popiaConsent") === "on",
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Registration failed");
      return;
    }

    const login = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setLoading(false);
    if (login?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Register as a driver (rentee) or vehicle owner. POPIA consent is required.
      </p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="field sm:col-span-2">
          <label htmlFor="name">Full name / business</label>
          <input id="name" name="name" required maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone / WhatsApp</label>
          <input id="phone" name="phone" required maxLength={25} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} />
        </div>
        <div className="field">
          <label htmlFor="role">I am a</label>
          <select id="role" name="role" required defaultValue="DRIVER">
            <option value="DRIVER">Driver / rentee</option>
            <option value="OWNER">Vehicle owner</option>
          </select>
        </div>
        <label className="sm:col-span-2 flex items-start gap-2 text-sm leading-relaxed">
          <input name="popiaConsent" type="checkbox" required className="mt-1" />
          <span>
            I consent to FleetMarket SA processing my personal information (name, email,
            phone, listing/request content) as described in the{" "}
            <Link href="/privacy" className="font-bold text-[var(--blue)]">
              Privacy Policy
            </Link>{" "}
            (version {POPIA_VERSION}), including retention and enquiry notifications.
          </span>
        </label>
        {error && <p className="sm:col-span-2 text-sm font-semibold text-red-600">{error}</p>}
        <button className="btn btn-primary sm:col-span-2" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
