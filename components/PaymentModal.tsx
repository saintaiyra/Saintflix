"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "@/components/AuthProvider";
import { getApiUrl } from "@/lib/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  movieId: string;
  movieTitle: string;
  type: "rental" | "purchase";
  price: number; // em centavos
  onSuccess: () => void;
  onClose: () => void;
}

function PaymentForm({ movieId, movieTitle, type, price, onSuccess, onClose }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { selectedProfile, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [purchaseId, setPurchaseId] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !selectedProfile || !token) return;

    setIsLoading(true);
    setError("");

    try {
      // 1. Criar checkout session no backend
      const response = await fetch(getApiUrl("/api/payments/create-checkout-session"), {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          movieId,
          profileId: selectedProfile._id,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao iniciar pagamento");
      }

      setClientSecret(data.clientSecret);
      setPurchaseId(data.purchaseId);

      // 2. Confirmar pagamento com Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Erro no pagamento");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // 3. Confirmar no backend
        const confirmResponse = await fetch(getApiUrl("/api/payments/confirm-payment"), {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            purchaseId: data.purchaseId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        const confirmData = await confirmResponse.json();

        if (confirmResponse.ok && confirmData.success) {
          onSuccess();
        } else {
          throw new Error(confirmData.message || "Erro ao confirmar pagamento");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount / 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6 border border-(--border) animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black">{type === "rental" ? "Alugar" : "Comprar"} Filme</h2>
            <p className="text-[var(--muted)]">{movieTitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-(--card)/50 transition-colors"
            aria-label="Fechar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-(--border) bg-[var(--background)] p-4">
            <label className="block text-sm font-medium mb-2">Cartão de crédito</label>
            <CardElement
              options={{
                style: {
                  base: {
                    color: "var(--foreground)",
                    fontFamily: "inherit",
                    fontSize: "16px",
                    "::placeholder": {
                      color: "var(--muted)",
                    },
                  },
                  invalid: {
                    color: "#ef4444",
                  },
                },
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold">{formatPrice(price)}</span>
            <span className="text-sm text-[var(--muted)]">
              {type === "rental" ? "Acesso por 48h" : "Acesso vitalício"}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !stripe}
            className="w-full rounded-full bg-[var(--primary)] py-3 font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processando..." : `Pagar ${formatPrice(price)}`}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Pagamento seguro processado por Stripe. Seus dados de cartão nunca são armazenados por nós.
        </p>
      </div>
    </div>
  );
}

export default function PaymentModal({
  movieId,
  movieTitle,
  type,
  price,
  onSuccess,
  onClose,
}: PaymentFormProps) {
  if (!stripePromise) {
    return null;
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm movieId={movieId} movieTitle={movieTitle} type={type} price={price} onSuccess={onSuccess} onClose={onClose} />
    </Elements>
  );
}