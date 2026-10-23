"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=6",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=7",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=8",
];

export default function ProfileSelectionPage() {
  const router = useRouter();
  const { user, selectedProfile, selectProfile, createProfile, isLoading: authLoading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isKid, setIsKid] = useState(false);
  const [error, setError] = useState("");

  const profiles = user?.profiles || [];

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newProfileName.trim()) {
      setError("Digite um nome para o perfil");
      return;
    }

    if (profiles.length >= 5) {
      setError("Limite de 5 perfis atingido");
      return;
    }

    try {
      const profile = await createProfile(newProfileName.trim(), isKid, selectedAvatar);
      selectProfile(profile._id);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar perfil");
    }
  };

  const handleSelectProfile = (profileId: string) => {
    selectProfile(profileId);
    router.push("/");
    router.refresh();
  };

  const handleAddProfile = () => {
    setIsCreating(true);
    setNewProfileName("");
    setSelectedAvatar(AVATARS[profiles.length % AVATARS.length]);
    setIsKid(false);
    setError("");
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setError("");
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex h-12 w-24 items-center justify-center rounded-full bg-[var(--primary)]" />
      </main>
    );
  }

  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex h-12 w-24 items-center justify-center rounded-full bg-[var(--primary)]" />
      </main>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8">
            <span className="text-[40px] font-black text-(--primary) tracking-[-1px]">SAINTFLIX</span>
          </Link>
          <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">Quem está assistindo?</h1>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {profiles.map((profile) => (
            <button
              key={profile._id}
              onClick={() => handleSelectProfile(profile._id)}
              className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl border border-(--border) bg-(--card)/50 backdrop-blur-sm transition-all hover:border-(--primary) hover:scale-[1.02] hover:bg-(--card)"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-(--primary)/20 to-(--primary)/5" />
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="relative w-full h-full rounded-full object-cover ring-4 ring-(--background)"
                  />
                ) : (
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-(--primary)/30 to-(--primary)/10 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-black text-(--primary)">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {profile.isKid && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                    👶
                  </span>
                )}
              </div>
              <span className="text-lg font-semibold text-center group-hover:text-(--primary) transition-colors">
                {profile.name}
              </span>
            </button>
          ))}

          {profiles.length < 5 && (
            <button
              onClick={handleAddProfile}
              className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-dashed border-(--border) bg-(--card)/30 backdrop-blur-sm transition-all hover:border-(--primary) hover:bg-(--card)/50"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-(--border) flex items-center justify-center group-hover:border-(--primary) transition-colors">
                  <svg className="w-10 h-10 text-[var(--muted)] group-hover:text-(--primary) transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
              </div>
              <span className="text-lg font-semibold text-[var(--muted)] group-hover:text-(--primary) transition-colors">
                Adicionar Perfil
              </span>
            </button>
          )}
        </div>

        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-[var(--card)] p-8 border border-(--border)">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Novo Perfil</h2>
                <button
                  onClick={handleCancelCreate}
                  className="p-2 rounded-full hover:bg-(--card)/50 transition-colors"
                  aria-label="Fechar"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateProfile} className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm" role="alert">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="profileName" className="block text-sm font-medium mb-2">
                    Nome do perfil
                  </label>
                  <input
                    type="text"
                    id="profileName"
                    autoFocus
                    required
                    maxLength={20}
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full rounded-lg border border-(--border) bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 transition-colors"
                    placeholder="Nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Avatar</label>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATARS.map((avatar, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`relative w-full aspect-square rounded-full overflow-hidden border-4 transition-all ${
                          selectedAvatar === avatar
                            ? "border-(--primary) scale-105 ring-2 ring-(--primary)/30"
                            : "border-transparent hover:border-(--border)"
                        }`}
                        aria-label={`Avatar ${index + 1}`}
                        aria-pressed={selectedAvatar === avatar}
                      >
                        <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isKid"
                    checked={isKid}
                    onChange={(e) => setIsKid(e.target.checked)}
                    className="w-5 h-5 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
                  />
                  <label htmlFor="isKid" className="text-sm text-[var(--foreground)] cursor-pointer">
                    Perfil infantil (conteúdo adequado para crianças)
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelCreate}
                    className="flex-1 rounded-full border border-(--border) bg-transparent py-3 font-semibold text-[var(--foreground)] transition-colors hover:bg-(--card)"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-[var(--primary)] py-3 font-bold text-white transition hover:scale-[1.02] hover:bg-[var(--primary-strong)]"
                  >
                    Criar Perfil
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/auth/login"
            onClick={(e) => {
              e.preventDefault();
              // Logout seria implementado aqui
              router.push("/auth/login");
              router.refresh();
            }}
            className="text-sm text-[var(--muted)] hover:text-(--foreground) transition-colors"
          >
            Trocar de conta
          </Link>
        </div>
      </div>
    </main>
  );
}