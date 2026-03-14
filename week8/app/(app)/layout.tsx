import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePromptChainAdmin } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requirePromptChainAdmin();
  if (!auth.allowed) {
    if (auth.reason === "not_logged_in") redirect("/");
    if (auth.reason === "forbidden") redirect("/forbidden");
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[color:var(--background)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <nav className="flex items-center gap-4">
            <Link
              href="/flavors"
              className="font-semibold text-amber-600 dark:text-amber-400"
            >
              Flavors
            </Link>
            <Link
              href="/test"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Test flavor
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
