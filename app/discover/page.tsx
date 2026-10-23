import { getApiUrl } from "@/lib/api";
import MovieRow from "@/components/MovieRow";
import type { Movie } from "@/app/types/movies";

interface MoviesResponse {
  results: Movie[];
}

async function getMovies(category: string): Promise<MoviesResponse> {
  const response = await fetch(
    getApiUrl(`/api/movies?category=${category}`),
    { cache: "no-store" }
  );
  if (!response.ok) throw new Error(`Failed to fetch ${category}`);
  return response.json();
}

export default async function DiscoverPage() {
  const [popularData, topRatedData, upcomingData, actionData, comedyData, horrorData, romanceData, scifiData] =
    await Promise.all([
      getMovies("popular"),
      getMovies("topRated"),
      getMovies("upcoming"),
      getMovies("action"),
      getMovies("comedy"),
      getMovies("horror"),
      getMovies("romance"),
      getMovies("science_fiction"),
    ]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <div className="mx-auto max-w-[750px] px-5 pb-24 pt-32 md:px-10 lg:px-14">
        <div className="mb-10 flex items-center gap-3">
          <span className="h-7 w-1 rounded-full bg-[var(--primary)]" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--primary)]">Explorar</p>
            <h1 className="mt-1 text-4xl font-black tracking-[-0.04em] md:text-5xl">Descobrir</h1>
          </div>
        </div>

        <MovieRow title="Populares" movies={popularData.results} />
        <MovieRow title="Mais Bem Avaliados" movies={topRatedData.results} />
        <MovieRow title="Em Breve" movies={upcomingData.results} />
        <MovieRow title="Ação" movies={actionData.results} />
        <MovieRow title="Comédia" movies={comedyData.results} />
        <MovieRow title="Terror" movies={horrorData.results} />
        <MovieRow title="Romance" movies={romanceData.results} />
        <MovieRow title="Ficção Científica" movies={scifiData.results} />
      </div>
    </main>
  );
}