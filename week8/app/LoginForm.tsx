"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

export function LoginForm() {
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createBrowserClient
  > | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://qihsgnfjqmkjmoowyfbn.supabase.co";
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaHNnbmZqcW1ram1vb3d5ZmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjc0MDAsImV4cCI6MjA2NTEwMzQwMH0.c9UQS_o2bRygKOEdnuRx7x7PeSf_OUGDtf9l3fMqMSQ";
    if (supabaseUrl && supabaseKey) {
      setSupabase(createBrowserClient(supabaseUrl, supabaseKey));
    }
  }, []);

  const handleLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  if (!isClient) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
        <p className="text-slate-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Prompt Chain Tool
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Sign in with Google (superadmin or matrix admin only)
        </p>
        <button
          type="button"
          onClick={handleLogin}
          disabled={!supabase}
          className="mt-6 w-full rounded-lg bg-amber-600 px-4 py-3 text-white hover:bg-amber-500 disabled:opacity-50"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
