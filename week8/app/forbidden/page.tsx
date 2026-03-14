import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
          Access denied
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Only superadmins or matrix admins can use this tool.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
