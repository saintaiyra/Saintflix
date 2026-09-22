import Hero from "@/components/Hero";
import MovieRow from "@/components/MovieRow";
import type { Movie } from "@/app/types/movies";

interface MoviesResponse {
  results: Movie[];
  hero?: Movie;
}

async function getMovies(category: string): Promise<MoviesResponse> {
  const response = await fetch(
    `http://localhost:3000/api/movies?category=${category}`,
    { cache: "no-store" }
  );

  if (!response.ok) throw new Error(`Failed to fetch ${category}`);
  return response.json();
}

export default async function Home() {
  const [trendingData, popularData, topRatedData, actionData, comedyData, horrorData] =
    await Promise.all([
      getMovies("trending"),
      getMovies("popular"),
      getMovies("topRated"),
      getMovies("action"),
      getMovies("comedy"),
      getMovies("horror"),
    ]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
      <Hero movie={trendingData.hero} />
      <MovieRow title="Trending Now" movies={trendingData.results} />
      <MovieRow title="Popular Movies" movies={popularData.results} />
      <MovieRow title="Top Rated" movies={topRatedData.results} />
      <MovieRow title="Action" movies={actionData.results} />
      <MovieRow title="Comedy" movies={comedyData.results} />
      <MovieRow title="Horror" movies={horrorData.results} />
    </main>
  );
}
