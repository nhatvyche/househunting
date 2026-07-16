import { SubmitForm } from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Add a listing</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Paste a Zillow, Redfin, or Realtor URL. Add the address too so it appears on the map
          (AI parsing is optional).
        </p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <SubmitForm />
      </div>
    </div>
  );
}
