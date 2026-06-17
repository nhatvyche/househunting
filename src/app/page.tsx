import Link from "next/link";
import { ArrowRight, Mail, MapPin, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <span className="text-lg font-semibold text-[var(--primary)]">HouseHunting</span>
        <Link
          href="/login"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
        >
          Sign in
        </Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--accent)]">
            Prototype · Free beta for testers
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-[var(--primary)] md:text-5xl">
            Save listings from email. See only your homes on the map.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
            HouseHunting replaces the shared spreadsheet with a per-user dashboard.
            Email listings to one shared inbox, and each tester sees only what they submitted.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-lg border border-[var(--border)] bg-white px-5 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            >
              How it works
            </a>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-[var(--border)] bg-white py-16"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
              <Mail className="mb-4 h-8 w-8 text-[var(--accent)]" />
              <h2 className="mb-2 text-lg font-semibold">Email or paste a URL</h2>
              <p className="text-sm text-[var(--muted)]">
                Keep using your Chrome extension flow. Send listings to the shared beta inbox
                and we match them to your account by sender email.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
              <Shield className="mb-4 h-8 w-8 text-[var(--accent)]" />
              <h2 className="mb-2 text-lg font-semibold">Your listings only</h2>
              <p className="text-sm text-[var(--muted)]">
                Unlike the spreadsheet prototype, each logged-in user sees a private list
                and map filtered to their submissions.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
              <MapPin className="mb-4 h-8 w-8 text-[var(--accent)]" />
              <h2 className="mb-2 text-lg font-semibold">Map your shortlist</h2>
              <p className="text-sm text-[var(--muted)]">
                Parsed addresses appear on an interactive map so you can compare neighborhoods
                at a glance.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-center text-sm text-[var(--muted)]">
        Built as a separate prototype — the existing Gmail + Sheets system stays untouched.
      </footer>
    </div>
  );
}
