import { NextResponse } from "next/server";

type TMDBVideo = {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?append_to_response=videos`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "TMDB request failed" },
        { status: response.status }
      );
    }

    const movie = await response.json();

    const videos: TMDBVideo[] = movie.videos?.results ?? [];

    const trailer =
      videos.find(
        (video) =>
          video.site === "YouTube" &&
          video.type === "Trailer" &&
          video.official === true
      ) ??
      videos.find(
        (video) =>
          video.site === "YouTube" &&
          video.type === "Trailer"
      );

    return NextResponse.json({
      ...movie,

      trailer: trailer
        ? {
            key: trailer.key,
            name: trailer.name,
            url: `https://www.youtube.com/watch?v=${trailer.key}`,
            embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
          }
        : null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}