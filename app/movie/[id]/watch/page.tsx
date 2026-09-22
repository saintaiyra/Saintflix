import Link from "next/link";

type WatchPageProps = { params: Promise<{ id: string }> };

type Movie = {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  trailer: { key: string; name: string; url: string; embedUrl: string } | null;
};

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const response = await fetch(`/api/movies/${id}`, { cache: "no-store" });

  if (!response.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center">
          <h1 className="text-3xl font-black">Filme não encontrado</h1>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white">Voltar</Link>
        </div>
      </main>
    );
  }

  const movie: Movie = await response.json();

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 pb-20 pt-24 text-[var(--foreground)] transition-colors duration-500 sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Link href={`/movie/${movie.id}`} className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--primary)]">← Voltar para o filme</Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-black shadow-2xl">
          {movie.trailer ? (
            <iframe
              src={movie.trailer.embedUrl}
              className="aspect-video w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={`${movie.title} - Trailer`}
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-black text-white/50">Trailer não disponível</div>
          )}
        </div>

        <div className="mt-8 max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--primary)]">Agora assistindo</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">{movie.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
            {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
            <span>⭐ {movie.vote_average.toFixed(1)}</span>
          </div>
          <p className="mt-5 leading-7 text-[var(--muted)]">{movie.overview}</p>
        </div>
      </div>
    </main>
  );
}
