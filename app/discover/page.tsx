import { getApiUrl } from "@/lib/api";
import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
}

interface DiscoverResponse {
  results: Movie[];
}

type DiscoverPageProps = {
  searchParams: Promise<{ genre?: string }>;
};

const genres = [
  { id: 28, name: "Ação" },
  { id: 35, name: "Comédia" },
  { id: 27, name: "Terror" },
  { id: 18, name: "Drama" },
  { id: 878, name: "Ficção Científica" },
  { id: 53, name: "Thriller" },
  { id: 10749, name: "Romance" },
];

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { genre = "28" } = await searchParams;
  const response = await fetch(
  getApiUrl(`/api/movies/discover?genre=${encodeURIComponent(genre)}`),
  { cache: "no-store" }
);

  if (!response.ok) throw new Error("Falha ao carregar filmes");
  const data: DiscoverResponse = await response.json();
  const activeGenre = genres.find((item) => String(item.id) === String(genre));

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] transition-colors duration-500 md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[var(--primary)]">
              <span className="h-px w-10 bg-[var(--primary)]" />
              Descoberta
            </div>
            <h1 className="text-5xl font-black tracking-[-0.04em] md:text-7xl">Descobrir</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Explore filmes por gênero e encontre sua próxima história.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {genres.map((item) => {
            const active = String(item.id) === String(genre);
            return (
              <Link
                key={item.id}
                href={`/discover?genre=${item.id}`}
                className={`rounded-full border px-5 py-2.5 text-sm transition-all ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]/70 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mb-6 mt-12 flex items-center gap-3">
          <span className="h-6 w-1 rounded-full bg-[var(--primary)]" />
          <h2 className="text-xl font-semibold md:text-2xl">
            {activeGenre?.name ?? "Filmes"}
          </h2>
        </div>

        <section className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {data.results.map((movie) => {
            const poster = movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null;

            return (
              <Link key={movie.id} href={`/movie/${movie.id}`} className="group">
                <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-[var(--primary)]">
                  {poster ? (
                    <img
                      src={poster}
                      alt={movie.title}
                      loading="lazy"
                      className="aspect-[2/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center text-sm text-[var(--muted)]">
                      Sem poster
                    </div>
                  )}
                </div>
                <h2 className="mt-3 truncate text-sm font-semibold">{movie.title}</h2>
                <div className="mt-1 flex justify-between text-xs text-[var(--muted)]">
                  <span>{movie.release_date?.slice(0, 4)}</span>
                  <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
