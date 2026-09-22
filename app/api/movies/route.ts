import { NextResponse } from "next/server";

function getRandomMovie<T>(movies: T[]): T | null {
  if (movies.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * movies.length);

  return movies[index];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category") || "trending";

    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB_API_KEY não configurada" },
        { status: 500 }
      );
    }

    let url: string;

    switch (category) {
      case "trending":
        url = "https://api.themoviedb.org/3/trending/movie/day";
        break;

      case "popular":
        url = "https://api.themoviedb.org/3/movie/popular";
        break;

      case "topRated":
        url = "https://api.themoviedb.org/3/movie/top_rated";
        break;

      case "action":
        url = "https://api.themoviedb.org/3/discover/movie?with_genres=28";
        break;

      case "comedy":
        url = "https://api.themoviedb.org/3/discover/movie?with_genres=35";
        break;

      case "horror":
        url = "https://api.themoviedb.org/3/discover/movie?with_genres=27";
        break;

      default:
        return NextResponse.json(
          { error: `Categoria inválida: ${category}` },
          { status: 400 }
        );
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "TMDB request failed",
          category,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (category === "trending") {
      const heroMovie = getRandomMovie(data.results);

      return NextResponse.json({
        ...data,
        hero: heroMovie,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Movies API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}