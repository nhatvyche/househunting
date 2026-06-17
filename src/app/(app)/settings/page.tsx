import { createClient } from "@/lib/supabase/server";
import { CopyBlock } from "@/components/CopyBlock";

const INBOX_EMAIL =
  process.env.NEXT_PUBLIC_INBOX_EMAIL ?? "househunting.betatest@gmail.com";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--primary)]">Setup</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Configure email submission and Chrome extension for the beta prototype.
        </p>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Your account email</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Listings are matched to you by sender address. Use this email when sending from
          Gmail or your extension:
        </p>
        <CopyBlock text={user?.email ?? ""} className="mt-3" />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Shared submission inbox</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Point your Chrome extension (or forward rules) to this shared address instead of a
          personal Gmail:
        </p>
        <CopyBlock text={INBOX_EMAIL} className="mt-3" />
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Gmail + Apps Script</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--muted)]">
          <li>Create the shared Gmail account and enable 2FA.</li>
          <li>Deploy the script in <code className="rounded bg-[var(--surface-2)] px-1">scripts/gmail-ingest.gs</code>.</li>
          <li>Set your deployed app URL and <code className="rounded bg-[var(--surface-2)] px-1">INGEST_API_KEY</code> in Script Properties.</li>
          <li>Run the time-driven trigger every 10 minutes (same as the current system).</li>
          <li>Each tester signs up here first so their sender email exists in the database.</li>
        </ol>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900">Prototype notes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-900/80">
          <li>The old spreadsheet system is unchanged — this is a parallel beta.</li>
          <li>AI parsing is optional; set <code className="rounded bg-white/60 px-1">ANTHROPIC_API_KEY</code> to enable it.</li>
          <li>Without AI, listings are saved with URL only and marked &quot;pending&quot;.</li>
        </ul>
      </section>
    </div>
  );
}
