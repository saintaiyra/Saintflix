"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Movie } from "@/app/types/movies";
import { useMyList } from "@/hooks/useMyList";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();
  const { isInList, toggle, isLoaded } = useMyList();

  // Netflix usa poster vertical (2:3) para os cards das rows
  // Igual a uma folha A4/PDF em pé
  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  const movieIsInList = isInList(movie.id);

  function handleMyList(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (isLoaded) {
      toggle(movie);
    }
  }

  function handleWatch(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/movie/${movie.id}/watch`);
  }

  // Netflix card: largura fixa ~190-200px, aspect ratio 2:3 (retrato)
  // Título FORA do card, embaixo
  return (
    <article className="group relative w-[190px] sm:w-[170px] md:w-[190px] lg:w-[205px] xl:w-[220px] shrink-0">
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover/card:-translate-y-2 group-hover/card:shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
          {image ? (
            <img
              src={image}
              alt={movie.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-(--muted)">
              Sem imagem
            </div>
          )}

          {/* Gradiente escuro no hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

          {/* Botões aparecem no hover SOBRE a imagem */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-full opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <button
              type="button"
              onClick={handleWatch}
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-2xl border border-(--primary) bg-black/70 text-sm font-medium text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)"
              aria-label={`Assistir ${movie.title}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>Assistir</span>
            </button>

            <button
              type="button"
              onClick={handleMyList}
              disabled={!isLoaded}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-(--primary) bg-black/70 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-(--primary) disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-(--primary)"
              aria-label={movieIsInList ? `Remover ${movie.title} da lista` : `Adicionar ${movie.title} à lista`}
            >
              {movieIsInList ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Título EMBaixo do card - estilo Netflix */}
      <div className="mt-3 px-1 w-full">
        <p className="truncate text-sm font-medium text-[var(--foreground)] leading-tight group-hover/card:text-[var(--primary)] transition-colors duration-200">
          {movie.title}
        </p>
        {movie.vote_average && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="font-medium text-[var(--foreground)]">{movie.vote_average.toFixed(1)}</span>
            </span>
            {movie.release_date && (
              <span className="text-[var(--muted)]">·</span>
            )}
            {movie.release_date && (
              <span className="text-[var(--muted)]">{movie.release_date.slice(0, 4)}</span>
            )}
          </p>
        )}
      </div>
    </article>
  );
}