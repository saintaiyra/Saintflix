import { getApiUrl } from "@/lib/api";
import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview?: string;
  release_date?: string;
  vote_average?: number;
}

interface SearchResponse {
  results: Movie[];
}

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
        <div className="mx-auto max-w-7xl">
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
        <div className="mx-auto max-w-7xl">
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

  const data: SearchResponse = await response.json();

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] transition-colors duration-500 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
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
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {data.results.map((movie) => {
              const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null;

              return (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-[var(--primary)]">
                    {poster ? (
                      <img
                        src={poster}
                        alt={movie.title}
                        loading="lazy"
                        className="aspect-[2/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center p-4 text-center text-sm text-[var(--muted)]">
                        Sem poster
                      </div>
                    )}
                  </div>

                  <h2 className="mt-3 truncate font-medium">
                    {movie.title}
                  </h2>

                  {movie.release_date && (
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {movie.release_date.slice(0, 4)}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}