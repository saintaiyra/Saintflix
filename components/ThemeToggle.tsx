"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--primary)] transition-all duration-300 hover:scale-105 hover:border-[var(--primary)]"
    >
      <span className="text-base" aria-hidden="true">
        {isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}
