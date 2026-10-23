"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { Movie } from "@/app/types/movies";

type MoviePageProps = { params: Promise<{ id: string }> };

type ApiMovie = Movie & {
  release_date?: string;
  trailer?: {
    key: string;
    name: string;
    url: string;
    embedUrl: string;
  } | null;
  videoUrl?: string;
};

export default function WatchPage({ params }: MoviePageProps) {
  const { selectedProfile, isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [poster, setPoster] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovie = async () => {
      // params is a Promise in Next.js 15+ client components
      const resolvedParams = await params;
      const movieId = resolvedParams.id;
      
      try {
        const response = await fetch(getApiUrl(`/api/movies/${movieId}`), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Filme não encontrado");
        }

        const data: ApiMovie = await response.json();

        const movieData: Movie = {
          id: data.id,
          title: data.title ?? "",
          overview: data.overview ?? "",
          backdrop_path: data.backdrop_path ?? null,
          poster_path: data.poster_path ?? null,
          vote_average: data.vote_average ?? 0,
        };

        setMovie(movieData);
        setVideoUrl(data.videoUrl ?? `https://example.com/video/${movieData.id}.mp4`);
        setPoster(movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null);

        // Verificar acesso
        if (selectedProfile) {
          const accessResponse = await fetch(
            getApiUrl(`/api/payments/access/${movieData.id}?profileId=${selectedProfile._id}`),
            {
              cache: "no-store",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (accessResponse.ok) {
            const accessData = await accessResponse.json();
            setHasAccess(accessData.hasAccess);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar filme");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [params, selectedProfile]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="animate-pulse flex h-12 w-24 items-center justify-center rounded-full bg-[var(--primary)]" />
        </main>
      </ProtectedRoute>
    );
  }

  if (error || !movie) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
          <div className="text-center">
            <h1 className="text-4xl font-black">Filme não encontrado</h1>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white"
            >
              Voltar para Home
            </Link>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!hasAccess) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h1 className="text-3xl font-black mb-2">Acesso não autorizado</h1>
            <p className="text-[var(--muted)] mb-6">
              Você precisa alugar ou comprar este filme para assistir.
            </p>
            <Link
              href={`/movie/${movie.id}`}
              className="inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--primary-strong)]"
            >
              Ver opções
            </Link>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        <div className="relative aspect-video w-full max-w-5xl mx-auto bg-black">
          <VideoPlayer src={videoUrl} poster={poster ?? undefined} />

          <Link
            href={`/movie/${movie.id}`}
            className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white transition hover:bg-black/70"
            aria-label="Voltar para detalhes"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        <section className="mx-auto max-w-5xl px-5 py-10 md:px-10 lg:px-14">
          <Link
            href={`/movie/${movie.id}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar para detalhes
          </Link>

          <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">
            {movie.title}
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
            {movie.overview || "Nenhuma descrição disponível."}
          </p>
        </section>
      </main>
    </ProtectedRoute>
  );
}