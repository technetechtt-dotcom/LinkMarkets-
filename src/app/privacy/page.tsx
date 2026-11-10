import { POPIA_VERSION } from "@/lib/constants";

export default function PrivacyPage() {
  const enquiryDays = process.env.DATA_RETENTION_ENQUIRY_DAYS || "365";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
        Privacy Policy (POPIA)
      </h1>
      <p className="text-sm text-[var(--muted)]">Version {POPIA_VERSION}</p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          FleetMarket SA (&quot;we&quot;) operates a vehicle rental marketplace for South
          African drivers and vehicle owners. This notice explains how we process personal
          information under the Protection of Personal Information Act 4 of 2013 (POPIA).
        </p>
        <h2 className="text-xl font-extrabold text-[var(--ink)]">Information we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account details: name, email, phone number, role (driver/owner/admin)</li>
          <li>Listing and rental-request content you submit</li>
          <li>Enquiry and reply messages between users</li>
          <li>Abuse reports and moderation notes</li>
          <li>Technical logs needed for security and rate limiting</li>
        </ul>
        <h2 className="text-xl font-extrabold text-[var(--ink)]">Purpose</h2>
        <p>
          We process information to operate the marketplace, authenticate users, deliver
          enquiries and request replies, moderate abuse, improve security, and meet legal
          obligations.
        </p>
        <h2 className="text-xl font-extrabold text-[var(--ink)]">Retention</h2>
        <p>
          Enquiry records are retained for approximately {enquiryDays} days by default.
          Abuse reports are retained longer for safety. Inactive accounts may be reviewed
          after about 3 years. You may request access, correction or deletion subject to
          legal holds.
        </p>
        <h2 className="text-xl font-extrabold text-[var(--ink)]">Sharing</h2>
        <p>
          Enquiry details are shared with the relevant listing owner so they can respond.
          We do not sell personal information. Processors (hosting, email) act under
          contract.
        </p>
        <h2 className="text-xl font-extrabold text-[var(--ink)]">Your rights</h2>
        <p>
          You may request access, correction, deletion, or objection where applicable.
          Contact the operator using the admin email configured for this deployment.
          You may lodge a complaint with the Information Regulator (South Africa).
        </p>
        <h2 className="text-xl font-extrabold text-[var(--ink)]">Consent</h2>
        <p>
          Account registration requires explicit consent to this policy. Consent logs store
          the policy version and timestamp.
        </p>
      </div>
    </div>
  );
}
