"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Movie } from "@/app/types/movies";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();
  const [isInList, setIsInList] = useState(false);

  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("my-list");
      const movies: Movie[] = saved ? JSON.parse(saved) : [];
      setIsInList(movies.some((item) => item.id === movie.id));
    } catch {
      setIsInList(false);
    }
  }, [movie.id]);

  function handleMyList(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

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

  function handleWatch(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/movie/${movie.id}/watch`);
  }

  return (
    <article className="group/card relative w-[170px] shrink-0 sm:w-[180px] md:w-[195px]">
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_12px_35px_rgba(0,0,0,0.10)] transition-all duration-500 group-hover/card:-translate-y-2 group-hover/card:shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          {image ? (
            <img
              src={image}
              alt={movie.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              Sem imagem
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

          <div className="absolute inset-x-0 bottom-0 translate-y-3 px-3 pb-3 opacity-0 transition-all duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <p className="truncate text-sm font-semibold text-white">{movie.title}</p>
          </div>
        </div>
      </Link>

      <div className="absolute bottom-3 left-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-500 group-hover/card:translate-y-0 group-hover/card:opacity-100">
        <button
          type="button"
          onClick={handleWatch}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--primary)] bg-black/65 text-sm text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-[var(--primary)]"
          aria-label={`Assistir ${movie.title}`}
        >
          ▶
        </button>

        <button
          type="button"
          onClick={handleMyList}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--primary)] bg-black/65 text-sm text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-[var(--primary)]"
          aria-label={isInList ? `Remover ${movie.title} da lista` : `Adicionar ${movie.title} à lista`}
        >
          {isInList ? "✓" : "+"}
        </button>
      </div>
    </article>
  );
}
