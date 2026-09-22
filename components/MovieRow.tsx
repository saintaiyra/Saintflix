"use client";

import { useRef } from "react";
import MovieCard from "./MovieCard";
import type { Movie } from "@/app/types/movies";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scrollLeft() {
    rowRef.current?.scrollBy({ left: -700, behavior: "smooth" });
  }

  function scrollRight() {
    rowRef.current?.scrollBy({ left: 700, behavior: "smooth" });
  }

  if (!movies?.length) return null;

  return (
    <section className="relative bg-[var(--background)] px-6 pb-12 pt-7 text-[var(--foreground)] transition-colors duration-500 md:px-12 lg:px-16">
      <div className="mb-6 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1 rounded-full bg-[var(--primary)]" />
          <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)] md:text-2xl">
            {title}
          </h2>
        </div>

        <button
          type="button"
          className="hidden text-[10px] font-medium uppercase tracking-[0.25em] text-[var(--muted)] transition-colors hover:text-[var(--primary)] md:block"
        >
          Ver todos
        </button>
      </div>

      <div className="group relative">
        <button
          type="button"
          onClick={scrollLeft}
          aria-label={`Voltar em ${title}`}
          className="absolute left-0 top-1/2 z-20 hidden h-12 w-10 -translate-y-1/2 items-center justify-center rounded-r-xl border border-[var(--border)] bg-[var(--card)]/90 text-2xl text-[var(--foreground)] opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white group-hover:opacity-100 md:flex"
        >
          ‹
        </button>

        <div ref={rowRef} className="movie-row flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        <button
          type="button"
          onClick={scrollRight}
          aria-label={`Avançar em ${title}`}
          className="absolute right-0 top-1/2 z-20 hidden h-12 w-10 -translate-y-1/2 items-center justify-center rounded-l-xl border border-[var(--border)] bg-[var(--card)]/90 text-2xl text-[var(--foreground)] opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white group-hover:opacity-100 md:flex"
        >
          ›
        </button>
      </div>
    </section>
  );
}
