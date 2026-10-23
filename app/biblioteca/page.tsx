"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { Movie } from "@/app/types/movies";

interface Purchase {
  _id: string;
  movie: Movie;
  type: "rental" | "purchase";
  purchasedAt: string;
  rentalExpiresAt?: string;
  profile: { _id: string; name: string };
}

export default function BibliotecaPage() {
  const { selectedProfile, isAuthenticated } = useAuth();
  const [owned, setOwned] = useState<Purchase[]>([]);
  const [rentals, setRentals] = useState<Purchase[]>([]);
  const [expiredRentals, setExpiredRentals] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"owned" | "rentals" | "expired">("owned");

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!selectedProfile) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          getApiUrl(`/api/payments/library?profileId=${selectedProfile._id}`),
          {
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOwned(data.owned || []);
          setRentals(data.rentals || []);
          setExpiredRentals(data.expiredRentals || []);
        }
      } catch (err) {
        console.error("Erro ao buscar biblioteca:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibrary();
  }, [selectedProfile]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getMoviesForTab = () => {
    switch (activeTab) {
      case "owned":
        return owned;
      case "rentals":
        return rentals;
      case "expired":
        return expiredRentals;
    }
  };

  const movies = getMoviesForTab();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[var(--background)] px-5 pb-24 pt-32 text-[var(--foreground)] transition-colors duration-500 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[750px]">
          <div className="mb-10 flex items-center gap-3">
            <span className="h-7 w-1 rounded-full bg-[var(--primary)]" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--primary)]">Sua biblioteca</p>
              <h1 className="mt-1 text-4xl font-black tracking-[-0.04em] md:text-5xl">Minhas Compras e Aluguéis</h1>
            </div>
          </div>

          {/* Tabs */}
          <nav className="mb-8 border-b border-(--border)" aria-label="Tipos de conteúdo">
            <ul className="flex gap-8" role="tablist">
              {[
                { id: "owned", label: "Comprados", count: owned.length, icon: "📚" },
                { id: "rentals", label: "Alugados", count: rentals.length, icon: "⏱️" },
                { id: "expired", label: "Expirados", count: expiredRentals.length, icon: "⏳" },
              ].map((tab) => (
                <li key={tab.id} role="presentation">
                  <button
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-(--primary) text-(--primary)"
                        : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                    <span className="rounded-full bg-(--card) px-2 py-0.5 text-xs">{tab.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40">
              <div className="text-center">
                <p className="text-lg font-semibold">Carregando biblioteca...</p>
              </div>
            </div>
          ) : movies.length === 0 ? (
            <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40">
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {activeTab === "owned"
                    ? "Nenhum filme comprado"
                    : activeTab === "rentals"
                    ? "Nenhum aluguel ativo"
                    : "Nenhum aluguel expirado"}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {activeTab === "owned"
                    ? "Filmes comprados aparecem aqui para acesso vitalício"
                    : activeTab === "rentals"
                    ? "Aluguéis ativos ficam disponíveis por 48 horas"
                    : "Aluguéis expirados podem ser renovados na página do filme"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-10">
              {movies.map((purchase) => (
                <div key={purchase._id} className="relative w-[130px] flex-shrink-0 group">
                  <MovieCard movie={purchase.movie} />
                  <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          purchase.type === "purchase"
                            ? "bg-green-500/90 text-white"
                            : "bg-blue-500/90 text-white"
                        }`}
                      >
                        {purchase.type === "purchase" ? "Comprado" : "Alugado"}
                      </span>
                      {purchase.type === "rental" && purchase.rentalExpiresAt && (
                        <span className="text-xs px-2 py-1 rounded bg-red-500/90 text-white">
                          Expira: {formatDate(purchase.rentalExpiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Adicionado em {formatDate(purchase.purchasedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}