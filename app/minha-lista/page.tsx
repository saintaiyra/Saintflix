"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/app/types/movies";

export default function MinhaListaPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("my-list");
      setMovies(saved ? JSON.parse(saved) : []);
    } catch {
      setMovies([]);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] transition-colors duration-500 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center gap-3">
          <span className="h-7 w-1 rounded-full bg-[var(--primary)]" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--primary)]">Sua seleção</p>
            <h1 className="mt-1 text-4xl font-black tracking-[-0.04em] md:text-5xl">Minha Lista</h1>
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40">
            <div className="text-center">
              <p className="text-lg font-semibold">Sua lista está vazia.</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Adicione filmes para encontrá-los aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-10">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
