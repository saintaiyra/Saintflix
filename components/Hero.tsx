"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Movie } from "@/app/types/movies";
import HeroBackground from "./HeroBackground";

interface HeroProps {
  movie?: Movie;
}

export default function Hero({ movie }: HeroProps) {
  const router = useRouter();
  const [isInList, setIsInList] = useState(false);

  useEffect(() => {
    if (!movie) {
      setIsInList(false);
      return;
    }

    const saved = localStorage.getItem("my-list");

    if (!saved) {
      setIsInList(false);
      return;
    }

    try {
      const movies: Movie[] = JSON.parse(saved);

      setIsInList(
        movies.some((item) => item.id === movie.id)
      );
    } catch {
      setIsInList(false);
    }
  }, [movie]);

  if (!movie) {
    return (
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-[var(--background)] px-6 md:px-12">
        <p className="text-[var(--foreground)]/60">
          Nenhum filme disponível.
        </p>
      </section>
    );
  }

  function handleMyList() {
    // Garante para o TypeScript que movie existe
    if (!movie) {
      return;
    }

    const saved = localStorage.getItem("my-list");

    let movies: Movie[] = [];

    try {
      movies = saved ? JSON.parse(saved) : [];
    } catch {
      movies = [];
    }

    const alreadyExists = movies.some(
      (item) => item.id === movie.id
    );

    if (alreadyExists) {
      const updated = movies.filter(
        (item) => item.id !== movie.id
      );

      localStorage.setItem(
        "my-list",
        JSON.stringify(updated)
      );

      setIsInList(false);
      return;
    }

    const updated = [...movies, movie];

    localStorage.setItem(
      "my-list",
      JSON.stringify(updated)
    );

    setIsInList(true);
  }

  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-[var(--background)]">

      {/* =====================================================
          IMAGEM DE FUNDO
      ====================================================== */}

      <HeroBackground
        backdropPath={movie.backdrop_path}
        title={movie.title}
      />

      {/* =====================================================
          DECORAÇÃO LATERAL
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          top-1/2
          hidden
          h-28
          w-px
          -translate-y-1/2
          bg-[var(--primary)]
          md:block
        "
      />

      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[72vh]
          max-w-7xl
          items-end
          px-6
          pb-24
          pt-32
          md:px-12
          lg:px-16
        "
      >
        <div className="w-full max-w-3xl">

          {/* =================================================
              INDICADOR LATERAL
          ================================================== */}

          <div
            className="
              mb-8
              flex
              items-center
              gap-4
              text-xs
              font-medium
              tracking-[0.35em]
              text-[var(--primary)]
            "
          >
            <span>01</span>

            <span className="text-[var(--primary)]/30">
              /
            </span>

            <span className="text-[var(--foreground)]/40">
              04
            </span>
          </div>

          {/* =================================================
              LABEL
          ================================================== */}

          <div
            className="
              mb-4
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.45em]
              text-[var(--primary)]
            "
          >
            Em destaque
          </div>

          {/* =================================================
              TÍTULO
          ================================================== */}

          <h1
            className="
              max-w-3xl
              text-5xl
              font-black
              leading-[0.92]
              tracking-[-0.04em]
              text-[var(--foreground)]
              md:text-7xl
              lg:text-[84px]
            "
          >
            {movie.title}
          </h1>

          {/* =================================================
              METADADOS
          ================================================== */}

          <div
            className="
              mt-6
              flex
              flex-wrap
              items-center
              gap-4
              text-sm
              text-[var(--foreground)]/70
            "
          >
            {movie.vote_average !== undefined && (
              <span className="font-semibold text-[var(--primary)]">
                ⭐ {movie.vote_average.toFixed(1)}
              </span>
            )}

            <span className="text-[var(--primary)]/40">
              •
            </span>

            <span>
              Filme
            </span>

            <span className="text-[var(--primary)]/40">
              •
            </span>

            <span>
              Saintflix Original Selection
            </span>
          </div>

          {/* =================================================
              SINOPSE
          ================================================== */}

          <p
            className="
              mt-6
              max-w-2xl
              line-clamp-3
              text-sm
              leading-7
              text-[var(--foreground)]/70
              md:text-base
            "
          >
            {movie.overview ||
              "Nenhuma descrição disponível."}
          </p>

          {/* =================================================
              BOTÕES
          ================================================== */}

          <div className="mt-8 flex flex-wrap gap-3">

            {/* ASSISTIR */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/movie/${movie.id}/watch`
                )
              }
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-[var(--primary)]
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
              ▶

              <span>
                Assistir agora
              </span>
            </button>

            {/* MINHA LISTA */}

            <button
              type="button"
              onClick={handleMyList}
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-[var(--primary)]/60
                bg-[var(--background)]/70
                px-7
                py-3.5
                font-bold
                text-[var(--primary)]
                backdrop-blur-sm
                transition-all
                duration-300
                hover:scale-105
                hover:bg-[var(--primary)]
                hover:text-white
              "
            >
              <span className="text-lg">
                +
              </span>

              <span>
                {isInList
                  ? "Na minha lista"
                  : "Minha Lista"}
              </span>
            </button>

          </div>

          {/* =================================================
              MARCA INFERIOR
          ================================================== */}

          <div className="mt-10 flex items-center gap-4">

            <div className="h-px w-20 bg-[var(--primary)]" />

            <span
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.45em]
                text-[var(--foreground)]/40
              "
            >
              Saintflix
            </span>

          </div>

        </div>
      </div>

      {/* =====================================================
          TEXTO DECORATIVO DO LADO DIREITO
      ====================================================== */}

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
        <div
          className="
            border-r
            border-[var(--primary)]/40
            pr-5
            text-[10px]
            uppercase
            leading-6
            tracking-[0.25em]
            text-[var(--foreground)]/60
          "
        >
          <div>
            Histórias
          </div>

          <div>
            que ficam
          </div>

          <div>
            com você
          </div>
        </div>
      </div>

      {/* =====================================================
          TRANSIÇÃO ORGÂNICA PARA O MOVIEROW
      ====================================================== */}

      <div
        className="
          absolute
          bottom-[-1px]
          left-1/2
          z-20
          h-20
          w-[125%]
          -translate-x-1/2
          rounded-[50%_50%_0_0]
          bg-[var(--background)]
        "
      />

      {/* LINHA DOURADA/ROXA DA TRANSIÇÃO */}

      <div
        className="
          absolute
          bottom-10
          left-1/2
          z-30
          h-px
          w-32
          -translate-x-1/2
          bg-[var(--primary)]/60
        "
      />

    </section>
  );
}