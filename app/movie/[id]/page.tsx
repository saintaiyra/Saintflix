import { getApiUrl } from "@/lib/api";
import MovieRow from "@/components/MovieRow";
import Link from "next/link";
import MovieDetailClient from "@/components/MovieDetailClient";
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
  rentalPrice?: number;
  purchasePrice?: number;
  videoUrl?: string;
};

export default async function MoviePage({ params }: MoviePageProps) {
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

  const similarResponse = await fetch(
    getApiUrl(`/api/movies/${id}/similar`),
    {
      cache: "no-store",
    }
  );

  const similarData = similarResponse.ok
    ? await similarResponse.json()
    : { results: [] };

  const similarMovies: Movie[] = (similarData.results ?? []).map(
    (item: Movie) => ({
      id: item.id,
      title: item.title ?? "",
      overview: item.overview ?? "",
      backdrop_path: item.backdrop_path ?? null,
      poster_path: item.poster_path ?? null,
      vote_average: item.vote_average ?? 0,
    })
  );

  return (
    <>
      <MovieDetailClient
        movie={movie}
        data={data}
        hasAccess={false} // Será verificado no client-side
        accessType={undefined}
        expiresAt={undefined}
      />
      {similarMovies.length > 0 && (
        <section className="mx-auto max-w-[750px] px-0 pb-20 md:px-0">
          <MovieRow
            title="Você também pode gostar"
            movies={similarMovies}
          />
        </section>
      )}
    </>
  );
}