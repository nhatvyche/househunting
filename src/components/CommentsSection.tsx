"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import type { ListingComment } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function CommentsSection({
  listingId,
  initialComments,
}: {
  listingId: string;
  initialComments: ListingComment[];
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to add comment");

      setComments((prev) => [...prev, data.comment]);
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    const response = await fetch(
      `/api/listings/${listingId}/comments?commentId=${commentId}`,
      { method: "DELETE" },
    );
    if (!response.ok) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--primary)]">Comments</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notes from a showing, questions for the agent, neighborhood thoughts…"
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          required
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Add comment
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-[var(--border)] bg-white p-3"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <span className="text-xs text-[var(--muted)]">
                  {formatDate(comment.created_at)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-600"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
