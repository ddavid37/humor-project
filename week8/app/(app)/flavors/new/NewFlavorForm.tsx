"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewFlavorForm({ columns }: { columns: string[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/flavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("err");
        setMessage(data.error || res.statusText);
        return;
      }
      setStatus("ok");
      setMessage("Created.");
      router.push(`/flavors/${data.id}`);
      router.refresh();
    } catch (err) {
      setStatus("err");
      setMessage(err instanceof Error ? err.message : "Request failed");
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 max-w-md space-y-4">
      {columns.map((col) => (
        <div key={col}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {col}
          </label>
          <input
            type="text"
            value={values[col] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [col]: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
      ))}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {status === "loading" ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600"
        >
          Cancel
        </button>
      </div>
      {message && (
        <p className={status === "err" ? "text-red-500" : "text-green-600"}>
          {message}
        </p>
      )}
    </form>
  );
}
