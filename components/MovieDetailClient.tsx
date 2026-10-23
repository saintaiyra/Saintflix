"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import MyListButton from "@/components/MyListButton";
import TrailerPlayer from "@/components/TrailerPlayer";
import PaymentModal from "@/components/PaymentModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { Movie } from "@/app/types/movies";

interface MovieDetailClientProps {
  movie: Movie;
  data: {
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
  hasAccess: boolean;
  accessType?: "rental" | "purchase";
  expiresAt?: string;
}

export default function MovieDetailClient({
  movie,
  data,
  hasAccess,
  accessType,
  expiresAt,
}: MovieDetailClientProps) {
  const { isAuthenticated, selectedProfile } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState<{ type: "rental" | "purchase"; price: number } | null>(null);

  const handlePaymentSuccess = () => {
    setShowPaymentModal(null);
    window.location.reload();
  };

  const rentalPrice = data.rentalPrice || 1490; // R$ 14,90
  const purchasePrice = data.purchasePrice || 4990; // R$ 49,90

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount / 100);
  };

  const handleRent = () => {
    if (!isAuthenticated || !selectedProfile) {
      // Redirecionar para login com callback
      window.location.href = `/auth/login?callbackUrl=/movie/${movie.id}`;
      return;
    }
    setShowPaymentModal({ type: "rental", price: rentalPrice });
  };

  const handleBuy = () => {
    if (!isAuthenticated || !selectedProfile) {
      window.location.href = `/auth/login?callbackUrl=/movie/${movie.id}`;
      return;
    }
    setShowPaymentModal({ type: "purchase", price: purchasePrice });
  };

  const handleWatch = () => {
    if (hasAccess) {
      window.location.href = `/movie/${movie.id}/watch`;
    } else if (isAuthenticated && selectedProfile) {
      // Mostrar opções de aluguel/compra
      setShowPaymentModal({ type: "rental", price: rentalPrice });
    } else {
      window.location.href = `/auth/login?callbackUrl=/movie/${movie.id}`;
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-500">
        <section className="relative min-h-[56vh] overflow-hidden bg-[var(--background)] pt-[74px]">
          {movie.backdrop_path && (
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}

          <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

          <div className="relative z-10 mx-auto flex min-h-[56vh] max-w-[750px] items-end px-5 pb-24 pt-20 md:px-10 lg:px-14">
            <div className="max-w-4xl">
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="mb-7 hidden w-36 rounded-xl border border-[var(--border)] shadow-2xl md:block"
                />
              )}

              <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[var(--primary)]">
                Detalhes do filme
              </p>

              <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.045em] md:text-7xl lg:text-[78px]">
                {movie.title}
              </h1>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
                {data.release_date && (
                  <span>{data.release_date.slice(0, 4)}</span>
                )}

                <span>⭐ {movie.vote_average.toFixed(1)}</span>

                {data.trailer && (
                  <span className="text-[var(--primary)]">
                    Trailer disponível
                  </span>
                )}

                {hasAccess && (
                  <span className="flex items-center gap-1 text-green-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {accessType === "purchase" ? "Sua biblioteca" : "Alugado"}
                    {expiresAt && accessType === "rental" && (
                      <>
                        <span>até</span>
                        <span>{new Date(expiresAt).toLocaleDateString("pt-BR")}</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <p className="mt-6 max-w-2xl leading-7 text-[var(--muted)]">
                {movie.overview || "Nenhuma descrição disponível."}
              </p>

              {data.trailer && (
                <div className="mt-8 mb-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                    Trailer
                  </h3>
                  <TrailerPlayer videoKey={data.trailer.key} />
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {hasAccess ? (
                  <Link
                    href={`/movie/${movie.id}/watch`}
                    className="rounded-full bg-[var(--primary)] px-7 py-3.5 font-bold text-white transition hover:scale-105 hover:bg-[var(--primary-strong)]"
                  >
                    ▶ Assistir agora
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleWatch}
                      className="rounded-full bg-[var(--primary)] px-7 py-3.5 font-bold text-white transition hover:scale-105 hover:bg-[var(--primary-strong)]"
                    >
                      {isAuthenticated && selectedProfile ? "Alugar ou Comprar" : "▶ Assistir agora"}
                    </button>
                  </>
                )}

                <MyListButton movie={movie} />
              </div>

              {!hasAccess && isAuthenticated && selectedProfile && (
                <div className="mt-6 p-4 rounded-xl border border-(--border) bg-(--card)/50">
                  <p className="text-sm font-medium mb-3">Opções de acesso:</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleRent}
                      className="flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-sm transition hover:border-(--primary) hover:bg-(--card)/80"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{formatPrice(rentalPrice)}</span>
                        <span className="text-xs text-[var(--muted)]">Aluguel por 48h</span>
                      </div>
                    </button>
                    <button
                      onClick={handleBuy}
                      className="flex items-center gap-2 rounded-lg border border-(--primary) bg-(--primary)/10 px-4 py-3 text-sm transition hover:bg-(--primary)/20"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-(--primary)">{formatPrice(purchasePrice)}</span>
                        <span className="text-xs text-[var(--primary)]">Compra vitalícia</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {!isAuthenticated && !hasAccess && (
                <div className="mt-6 p-4 rounded-xl border border-(--border) bg-(--card)/50 text-center">
                  <p className="text-sm text-[var(--muted)]">
                    Faça login para alugar ou comprar este filme
                  </p>
                  <div className="mt-3 flex gap-2 justify-center">
                    <Link
                      href={`/auth/login?callbackUrl=/movie/${movie.id}`}
                      className="rounded-full border border-(--border) px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-(--primary) hover:text-(--primary)"
                    >
                      Entrar
                    </Link>
                    <Link
                      href={`/auth/register?callbackUrl=/movie/${movie.id}`}
                      className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--primary-strong)]"
                    >
                      Criar conta
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[750px] px-0 pb-20 md:px-0">
          <div id="similar-movies" />
        </section>
      </main>

      {showPaymentModal && (
        <PaymentModal
          movieId={movie.id.toString()}
          movieTitle={movie.title}
          type={showPaymentModal.type}
          price={showPaymentModal.price}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(null)}
        />
      )}
    </>
  );
}