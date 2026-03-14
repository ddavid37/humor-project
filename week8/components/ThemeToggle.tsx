"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-current/20 p-1">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded px-2 py-1 text-sm ${theme === "light" ? "bg-amber-500/30 text-amber-700 dark:text-amber-300" : "opacity-70 hover:opacity-100"}`}
        title="Light"
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded px-2 py-1 text-sm ${theme === "dark" ? "bg-amber-500/30 text-amber-700 dark:text-amber-300" : "opacity-70 hover:opacity-100"}`}
        title="Dark"
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`rounded px-2 py-1 text-sm ${theme === "system" ? "bg-amber-500/30 text-amber-700 dark:text-amber-300" : "opacity-70 hover:opacity-100"}`}
        title="System"
      >
        System
      </button>
    </div>
  );
}
