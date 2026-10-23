"use client";

import { useEffect, useState, useCallback } from "react";
import { getApiUrl } from "@/lib/api";
import type { Movie } from "@/app/types/movies";
import { useAuth } from "@/components/AuthProvider";

export function useMyList() {
  const { token, selectedProfile, isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchMyList = useCallback(async () => {
    if (!isAuthenticated || !selectedProfile || !token) {
      setMovies([]);
      setIsLoaded(true);
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/my-list/${selectedProfile._id}`), {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedMovies: Movie[] = data.map((item: any) => ({
          id: item._id || item.id,
          title: item.title,
          overview: item.overview,
          backdrop_path: item.backdrop_path,
          poster_path: item.poster_path,
          vote_average: item.vote_average,
        }));
        setMovies(formattedMovies);
      }
    } catch (err) {
      console.error("Erro ao buscar minha lista:", err);
      setMovies([]);
    } finally {
      setIsLoaded(true);
    }
  }, [isAuthenticated, selectedProfile, token]);

  useEffect(() => {
    fetchMyList();
  }, [fetchMyList]);

  const isInList = useCallback(
    (movieId: number) => {
      return movies.some((item) => item.id === movieId);
    },
    [movies]
  );

  const toggle = useCallback(
    async (movie: Movie) => {
      if (!isAuthenticated || !selectedProfile || !token) return;

      const exists = movies.some((item) => item.id === movie.id);

      try {
        if (exists) {
          await fetch(getApiUrl("/api/my-list"), {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ profileId: selectedProfile._id, movieId: movie.id }),
          });
          setMovies((prev) => prev.filter((item) => item.id !== movie.id));
        } else {
          await fetch(getApiUrl("/api/my-list"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ profileId: selectedProfile._id, movieId: movie.id }),
          });
          setMovies((prev) => [...prev, movie]);
        }
      } catch (err) {
        console.error("Erro ao atualizar lista:", err);
      }
    },
    [isAuthenticated, selectedProfile, token, movies]
  );

  return {
    movies,
    isLoaded,
    isInList,
    toggle,
    count: movies.length,
    refresh: fetchMyList,
  };
}