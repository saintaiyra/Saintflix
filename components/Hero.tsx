"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Movie } from "@/app/types/movies";

import HeroBackground from "./HeroBackground";
import { useMyList } from "@/hooks/useMyList";

interface HeroProps {
  movie?: Movie;
}

export default function Hero({ movie }: HeroProps) {
  const router = useRouter();
  const { isInList, toggle, isLoaded } = useMyList();

  const movieIsInList = movie ? isInList(movie.id) : false;

  if (!movie) {
    return (
      <section className="relative flex min-h-[50vh] items-center overflow-hidden bg-background px-6 md:px-12">
        <p className="text-(--foreground)/60">Nenhum filme disponível.</p>
      </section>
    );
  }

  function handleMyList() {
    if (!movie) return;
    toggle(movie);
  }

  return (
    <section className="relative min-h-[56vh] overflow-hidden bg-background">
      <HeroBackground backdropPath={movie.backdrop_path} title={movie.title} />

      <div
        className="
          absolute
          left-0
          top-1/2
          hidden
          h-28
          w-px
          -translate-y-1/2
          bg-(--primary)
          md:block
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[56vh]
          max-w-none
          items-end
          px-6
          pb-24
          pt-32
          md:px-12
          lg:px-16
        "
      >
        <div className="w-full max-w-3xl">
          <div
            className="
              mb-8
              flex
              items-center
              gap-4
              text-xs
              font-medium
              tracking-[0.35em]
              text-(--primary)
            "
          >
            <span>01</span>
            <span className="text-(--primary)/30">/</span>
            <span className="text-(--foreground)/40">04</span>
          </div>

          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.45em] text-(--primary)">
            Em destaque
          </div>

          <h1
            className="
              max-w-3xl
              text-5xl
              font-black
              leading-[0.92]
              tracking-[-0.04em]
              text-foreground
              md:text-7xl
              lg:text-[84px]
            "
          >
            {movie.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-(--foreground)/70">
            {movie.vote_average !== undefined && (
              <span className="font-semibold text-(--primary)">
                ⭐ {movie.vote_average.toFixed(1)}
              </span>
            )}

            <span className="text-(--primary)/40">•</span>
            <span>Filme</span>
            <span className="text-(--primary)/40">•</span>
            <span>Saintflix Original Selection</span>
          </div>

          <p className="mt-6 max-w-2xl line-clamp-3 text-sm leading-7 text-(--foreground)/70 md:text-base">
            {movie.overview || "Nenhuma descrição disponível."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push(`/movie/${movie.id}/watch`)}
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-(--primary)
                px-7
                py-3.5
                font-bold
                text-white
                shadow-[0_12px_35px_rgba(184,134,43,0.25)]
                transition-all
                duration-300
                hover:scale-105
                hover:brightness-110
              "
            >
              ▶ <span>Assistir agora</span>
            </button>

            <button
              type="button"
              onClick={handleMyList}
              disabled={!isLoaded}
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-(--primary)/60
                bg-(--background)/70
                px-7
                py-3.5
                font-bold
                text-(--primary)
                backdrop-blur-sm
                transition-all
                duration-300
                hover:scale-105
                hover:bg-(--primary)
                hover:text-white
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <span className="text-lg">+</span>
              <span>{movieIsInList ? "Na minha lista" : "Minha Lista"}</span>
            </button>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="h-px w-20 bg-(--primary)" />
            <span className="text-[9px] font-medium uppercase tracking-[0.45em] text-(--foreground)/40">
              Saintflix
            </span>
          </div>
        </div>
      </div>

      <div
        className="
          absolute
          right-8
          top-1/2
          hidden
          -translate-y-1/2
          text-right
          md:block
        "
      >
        <div className="border-r border-(--primary)/40 pr-5 text-[10px] uppercase leading-6 tracking-[0.25em] text-(--foreground)/60">
          <div>Histórias</div>
          <div>que ficam</div>
          <div>com você</div>
        </div>
      </div>

      <div className="absolute -bottom-px left-1/2 z-20 h-20 w-[125%] -translate-x-1/2 rounded-[50%_50%_0_0] bg-background" />
      <div className="absolute bottom-10 left-1/2 z-30 h-px w-32 -translate-x-1/2 bg-(--primary)/60" />
    </section>
  );
}