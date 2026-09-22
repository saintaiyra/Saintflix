import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("query");
    const page = searchParams.get("page") ?? "1";

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&language=pt-BR&page=${page}`,
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
        { error: "TMDB search request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}