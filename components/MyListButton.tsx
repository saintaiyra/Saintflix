"use client";

import { useEffect, useState } from "react";
import type { Movie } from "@/app/types/movies";

export default function MyListButton({ movie }: { movie: Movie }) {
  const [isInList, setIsInList] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("my-list");
      const movies: Movie[] = saved ? JSON.parse(saved) : [];
      setIsInList(movies.some((item) => item.id === movie.id));
    } catch {
      setIsInList(false);
    }
  }, [movie.id]);

  function toggleList() {
    try {
      const saved = localStorage.getItem("my-list");
      const movies: Movie[] = saved ? JSON.parse(saved) : [];
      const exists = movies.some((item) => item.id === movie.id);
      const updated = exists
        ? movies.filter((item) => item.id !== movie.id)
        : [...movies, movie];

      localStorage.setItem("my-list", JSON.stringify(updated));
      setIsInList(!exists);
    } catch {
      setIsInList(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleList}
      className="rounded-full border border-[var(--border)] bg-[var(--card)]/70 px-6 py-3 font-semibold text-[var(--foreground)] backdrop-blur-sm transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      {isInList ? "✓ Na minha lista" : "+ Minha Lista"}
    </button>
  );
}
