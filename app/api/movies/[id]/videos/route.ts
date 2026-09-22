import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos`,
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

    const data = await response.json();

    const trailer = data.results.find(
      (video: {
        site: string;
        type: string;
        official?: boolean;
      }) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official === true
    );

    return NextResponse.json({
      trailer: trailer ?? null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}