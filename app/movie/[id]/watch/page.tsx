import { getApiUrl } from "@/lib/api";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
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

export default async function WatchPage({ params }: MoviePageProps) {
  const { id } = await params;

  const response = await fetch(getApiUrl(`/api/movies/${id}`), {
    cache: "no-store",
  });

  if (!response.ok) {
    return (
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
    );
  }

  const data: ApiMovie = await response.json();

  const movie: Movie = {
    id: data.id,
    title: data.title ?? "",
    overview: data.overview ?? "",
    backdrop_path: data.backdrop_path ?? null,
    poster_path: data.poster_path ?? null,
    vote_average: data.vote_average ?? 0,
  };

  const videoUrl = data.videoUrl ?? `https://example.com/video/${movie.id}.mp4`;
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
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
  );
}