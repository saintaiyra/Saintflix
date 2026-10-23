"use client";

import { useEffect, useState, useCallback } from "react";
import type { Movie } from "@/app/types/movies";

export function useMyList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("my-list");
      setMovies(saved ? JSON.parse(saved) : []);
    } catch {
      setMovies([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const isInList = useCallback((movieId: number) => {
    return movies.some((item) => item.id === movieId);
  }, [movies]);

  const toggle = useCallback((movie: Movie) => {
    try {
      const exists = movies.some((item) => item.id === movie.id);
      const updated = exists
        ? movies.filter((item) => item.id !== movie.id)
        : [...movies, movie];

      localStorage.setItem("my-list", JSON.stringify(updated));
      setMovies(updated);
    } catch {
      // Silently fail
    }
  }, [movies]);

  const add = useCallback((movie: Movie) => {
    if (!movies.some((item) => item.id === movie.id)) {
      const updated = [...movies, movie];
      localStorage.setItem("my-list", JSON.stringify(updated));
      setMovies(updated);
    }
  }, [movies]);

  const remove = useCallback((movieId: number) => {
    const updated = movies.filter((item) => item.id !== movieId);
    localStorage.setItem("my-list", JSON.stringify(updated));
    setMovies(updated);
  }, [movies]);

  const clear = useCallback(() => {
    localStorage.setItem("my-list", JSON.stringify([]));
    setMovies([]);
  }, []);

  return {
    movies,
    isLoaded,
    isInList,
    toggle,
    add,
    remove,
    clear,
    count: movies.length,
  };
}