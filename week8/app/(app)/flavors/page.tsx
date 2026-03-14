import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function FlavorsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("*")
    .order("id");

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Humor Flavors</h1>
        <p className="mt-2 text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  const nameKey =
    flavors?.length &&
    Object.keys(flavors[0] as object).find((k) => {
      const lower = k.toLowerCase();
      return lower.includes("name") || lower.includes("title");
    });

  const descriptionKey =
    flavors?.length &&
    Object.keys(flavors[0] as object).find((k) => {
      const lower = k.toLowerCase();
      return (
        lower.includes("description") ||
        lower.includes("desc") ||
        lower.includes("summary") ||
        lower.includes("goal")
      );
    });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Humor Flavors</h1>
        <Link
          href="/flavors/new"
          className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-500"
        >
          New flavor
        </Link>
      </div>

      <ul className="space-y-2">
        {(flavors ?? []).map((f: Record<string, unknown>) => (
          <li
            key={String(f.id)}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="truncate font-medium">
                  {nameKey ? String(f[nameKey] ?? f.id) : String(f.id)}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {String(f.id)}
                </span>
              </div>
              {descriptionKey && f[descriptionKey] && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {String(f[descriptionKey])}
                </p>
              )}
            </div>
            <Link
              href={`/flavors/${f.id}`}
              className="rounded bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Edit & steps
            </Link>
          </li>
        ))}
      </ul>

      {(!flavors || flavors.length === 0) && (
        <p className="text-slate-500">No flavors yet. Create one to get started.</p>
      )}
    </div>
  );
}
