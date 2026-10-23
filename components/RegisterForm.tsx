"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-[28px] font-black text-(--primary) tracking-[-1px]">SAINTFLIX</span>
          </Link>
          <h1 className="text-3xl font-black tracking-[-0.04em]">Criar sua conta</h1>
          <p className="mt-2 text-[var(--muted)]">Comece a assistir hoje mesmo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading || authLoading}
              className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-colors disabled:opacity-50"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading || authLoading}
              className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-colors disabled:opacity-50"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading || authLoading}
                className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-colors disabled:opacity-50 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirmar senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading || authLoading}
              className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-colors disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <div className="rounded-lg border border-(--border) bg-(--card)/50 p-4 text-sm text-[var(--muted)]">
            <p className="font-medium text-[var(--foreground)] mb-2">Ao criar sua conta, você concorda com:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-(--primary) flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <Link href="/termos" className="underline hover:text-(--primary)">Termos de Uso</Link>
              </li>
              <li className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-(--primary) flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <Link href="/privacidade" className="underline hover:text-(--primary)">Política de Privacidade</Link>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full rounded-full bg-[var(--primary)] py-3.5 font-bold text-white transition hover:scale-[1.02] hover:bg-[var(--primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading || authLoading ? "Criando conta..." : "Criar conta grátis"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Já tem conta?{" "}
          <Link href="/auth/login" className="text-(--primary) font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}