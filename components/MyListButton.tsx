"use client";

import type { Movie } from "@/app/types/movies";
import { useMyList } from "@/hooks/useMyList";

export default function MyListButton({ movie }: { movie: Movie }) {
  const { isInList, toggle, isLoaded } = useMyList();

  const movieIsInList = isInList(movie.id);

  return (
    <button
      type="button"
      onClick={() => toggle(movie)}
      disabled={!isLoaded}
      className="rounded-full border border-(--border) bg-(--card)/70 px-6 py-3 font-semibold text-foreground backdrop-blur-sm transition-all hover:border-(--primary) hover:text-(--primary) disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {movieIsInList ? "✓ Na minha lista" : "+ Minha Lista"}
    </button>
  );
}