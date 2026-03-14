"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const API_BASE = "https://api.almostcrackd.ai";

export function TestRunner({ flavorIds }: { flavorIds: string[] }) {
  const [flavorId, setFlavorId] = useState(flavorIds[0] ?? "");
  const [imageId, setImageId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "err">("idle");
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState("");

  const runTest = async () => {
    if (!imageId.trim()) {
      setError("Enter an image ID");
      return;
    }
    setStatus("loading");
    setError("");
    setCaptions([]);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setError("Not logged in");
      setStatus("err");
      return;
    }

    try {
      const body: Record<string, string> = { imageId: imageId.trim() };
      if (flavorId) body.humor_flavor_id = flavorId;

      const res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [data];
      const texts = list.map((c: { caption?: string; content?: string; text?: string }) =>
        String(c.caption ?? c.content ?? c.text ?? JSON.stringify(c))
      );
      setCaptions(texts);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setStatus("err");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Humor flavor
          </label>
          <select
            value={flavorId}
            onChange={(e) => setFlavorId(e.target.value)}
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">— None —</option>
            {flavorIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Image ID
          </label>
          <input
            type="text"
            value={imageId}
            onChange={(e) => setImageId(e.target.value)}
            placeholder="UUID of an image in the DB"
            className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <button
          type="button"
          onClick={runTest}
          disabled={status === "loading"}
          className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {status === "loading" ? "Generating…" : "Generate captions"}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {captions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Captions produced
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-800 dark:text-slate-200">
            {captions.map((cap, i) => (
              <li key={i}>{cap}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
