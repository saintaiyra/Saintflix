import { getApiUrl } from "@/lib/api";
import Link from "next/link";
import type { Movie, TMDBResponse } from "@/app/types/movies";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  if (!query) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 pb-20 pt-32 text-[var(--foreground)] md:px-10 lg:px-14">
        <div className="mx-auto max-w-[750px]">
          <div className="flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-[var(--primary)]" />

            <h1 className="text-4xl font-black">
              Buscar filmes
            </h1>
          </div>

          <p className="mt-4 text-[var(--muted)]">
            Digite algo na busca para encontrar filmes.
          </p>
        </div>
      </main>
    );
  }

  const response = await fetch(
    getApiUrl(
      `/api/movies/search?query=${encodeURIComponent(query)}`
    ),
    { cache: "no-store" }
  );

  if (!response.ok) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 pb-20 pt-32 text-[var(--foreground)] md:px-10 lg:px-14">
        <div className="mx-auto max-w-[750px]">
          <h1 className="text-4xl font-black">
            Erro na busca
          </h1>

          <p className="mt-4 text-[var(--muted)]">
            Não foi possível buscar “{query}”.
          </p>
        </div>
      </main>
    );
  }

  const data: TMDBResponse<Movie> = await response.json();

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] transition-colors duration-500 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[750px]">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1 rounded-full bg-[var(--primary)]" />

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--primary)]">
              Busca
            </p>

            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              Resultados para “{query}”
            </h1>
          </div>
        </div>

        {data.results.length === 0 ? (
          <p className="mt-10 text-[var(--muted)]">
            Nenhum filme encontrado.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {data.results.map((movie) => {
              const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                : null;

              return (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[var(--primary)] group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
                    {poster ? (
                      <img
                        src={poster}
                        alt={movie.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[var(--muted)]">
                        Sem poster
                      </div>
                    )}

                    {/* Gradiente no hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Título embaixo - estilo Netflix */}
                  <div className="mt-3 px-1 w-full">
                    <p className="truncate text-sm font-medium text-[var(--foreground)] leading-tight group-hover:text-[var(--primary)] transition-colors duration-200">
                      {movie.title}
                    </p>
                    {movie.vote_average && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                        <span className="flex items-center gap-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <span className="font-medium text-[var(--foreground)]">{movie.vote_average.toFixed(1)}</span>
                        </span>
                        {movie.release_date && (
                          <>
                            <span className="text-[var(--muted)]">·</span>
                            <span className="text-[var(--muted)]">{movie.release_date.slice(0, 4)}</span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}