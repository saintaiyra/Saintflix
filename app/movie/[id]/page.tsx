import MovieRow from "@/components/MovieRow";
import Link from "next/link";
import MyListButton from "@/components/MyListButton";
import type { Movie } from "@/app/types/movies";

type MoviePageProps = { params: Promise<{ id: string }> };

type ApiMovie = Movie & {
  release_date?: string;
  trailer?: { key: string; name: string; url: string; embedUrl: string } | null;
};

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  const response = await fetch(`http://localhost:3000/api/movies/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
        <div className="text-center">
          <h1 className="text-4xl font-black">Filme não encontrado</h1>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-semibold text-white">
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

  const similarResponse = await fetch(`http://localhost:3000/api/movies/${id}/similar`, {
    cache: "no-store",
  });
  const similarData = similarResponse.ok ? await similarResponse.json() : { results: [] };
  const similarMovies: Movie[] = (similarData.results ?? []).map((item: Movie) => ({
    id: item.id,
    title: item.title ?? "",
    overview: item.overview ?? "",
    backdrop_path: item.backdrop_path ?? null,
    poster_path: item.poster_path ?? null,
    vote_average: item.vote_average ?? 0,
  }));

  const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;
  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <section className="relative min-h-[82vh] overflow-hidden bg-[var(--background)] pt-[74px]">
        {backdrop && <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
        <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl items-end px-5 pb-24 pt-20 md:px-10 lg:px-14">
          <div className="max-w-4xl">
            {poster && (
              <img src={poster} alt={movie.title} className="mb-7 hidden w-36 rounded-xl border border-[var(--border)] shadow-2xl md:block" />
            )}

            <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[var(--primary)]">Detalhes do filme</p>
            <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.045em] md:text-7xl lg:text-[78px]">{movie.title}</h1>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
              {data.release_date && <span>{data.release_date.slice(0, 4)}</span>}
              <span>⭐ {movie.vote_average.toFixed(1)}</span>
              {data.trailer && <span className="text-[var(--primary)]">Trailer disponível</span>}
            </div>

            <p className="mt-6 max-w-2xl leading-7 text-[var(--muted)]">{movie.overview || "Nenhuma descrição disponível."}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/movie/${movie.id}/watch`} className="rounded-full bg-[var(--primary)] px-7 py-3.5 font-bold text-white transition hover:scale-105 hover:bg-[var(--primary-strong)]">
                ▶ Assistir agora
              </Link>
              <MyListButton movie={movie} />
            </div>
          </div>
        </div>
      </section>

      {similarMovies.length > 0 && (
        <section className="mx-auto max-w-7xl px-0 pb-20 md:px-0">
          <MovieRow title="Você também pode gostar" movies={similarMovies} />
        </section>
      )}
    </main>
  );
}
