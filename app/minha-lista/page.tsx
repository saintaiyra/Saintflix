"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getApiUrl } from "@/lib/api";
import type { Movie } from "@/app/types/movies";

export default function MinhaListaPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyList = async () => {
      try {
        const response = await fetch(getApiUrl("/api/my-list"), {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // O backend retorna array de filmes com _id, converter para formato Movie
          const formattedMovies: Movie[] = data.map((item: any) => ({
            id: item._id || item.id,
            title: item.title,
            overview: item.overview,
            backdrop_path: item.backdrop_path,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
          }));
          setMovies(formattedMovies);
        }
      } catch (err) {
        console.error("Erro ao buscar minha lista:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyList();
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] transition-colors duration-500 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[750px]">
          <div className="mb-10 flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-[var(--primary)]" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--primary)]">Sua seleção</p>
              <h1 className="mt-1 text-4xl font-black tracking-[-0.04em] md:text-5xl">Minha Lista</h1>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40">
              <div className="text-center">
                <p className="text-lg font-semibold">Carregando...</p>
              </div>
            </div>
          ) : movies.length === 0 ? (
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
    </ProtectedRoute>
  );
}