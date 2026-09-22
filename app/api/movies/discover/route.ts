import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");

    if (!genre) {
      return NextResponse.json(
        { error: "Genre is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${encodeURIComponent(
        genre
      )}&language=pt-BR&page=1&sort_by=popularity.desc`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("TMDB ERROR:", data);

      return NextResponse.json(
        {
          error: "TMDB request failed",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("DISCOVER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}