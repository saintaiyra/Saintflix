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

export default function AccountPage() {
  const router = useRouter();
  const { user, selectedProfile, updateProfile, deleteProfile, updateUserProfile, changePassword, logout, fetchProfiles } = useAuth();
  const [activeTab, setActiveTab] = useState<"profiles" | "account" | "password">("profiles");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editIsKid, setEditIsKid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const profiles = user?.profiles || [];

  const handleSaveProfile = async (profileId: string) => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await updateProfile(profileId, {
        name: editName,
        avatar: editAvatar,
        isKid: editIsKid,
      });
      setSuccess("Perfil atualizado com sucesso");
      setIsEditing(null);
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm("Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.")) return;

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await deleteProfile(profileId);
      setSuccess("Perfil excluído com sucesso");
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (profile: typeof profiles[0]) => {
    setIsEditing(profile._id);
    setEditName(profile.name);
    setEditAvatar(profile.avatar || "");
    setEditIsKid(profile.isKid);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setError("");
    setSuccess("");
  };

  const handleAddProfile = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Create a temporary profile name
      const profile = await updateProfile("new", { name: "Novo Perfil", isKid: false });
      // This won't work directly, we'd need a create endpoint
      // For now, redirect to profiles page
      router.push("/profiles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const avatar = formData.get("avatar") as string;

    try {
      await updateUserProfile({ name, avatar });
      setSuccess("Conta atualizada com sucesso");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("As novas senhas não conferem");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Senha alterada com sucesso");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-block mb-6">
            <span className="text-[32px] font-black text-(--primary) tracking-[-1px]">SAINTFLIX</span>
          </Link>
          <h1 className="text-4xl font-black tracking-[-0.04em]">Conta</h1>
          <p className="mt-2 text-[var(--muted)]">Gerencie seu perfil, configurações e assinatura</p>
        </div>

        {/* Alerts */}
        {(error || success) && (
          <div className="mb-6 rounded-lg border p-4 animate-slide-down" role="alert">
            {error && <div className="border-red-500/20 bg-red-500/10 text-red-400">{error}</div>}
            {success && <div className="border-green-500/20 bg-green-500/10 text-green-400">{success}</div>}
          </div>
        )}

        {/* Tabs */}
        <nav className="mb-8 border-b border-(--border)" aria-label="Configurações da conta">
          <ul className="flex gap-8" role="tablist">
            {[
              { id: "profiles", label: "Perfis", icon: "👤" },
              { id: "account", label: "Conta", icon: "⚙️" },
              { id: "password", label: "Senha", icon: "🔒" },
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
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Perfis Tab */}
        {activeTab === "profiles" && (
          <section aria-labelledby="profiles-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="profiles-heading" className="text-2xl font-bold">
                Gerenciar Perfis
              </h2>
              {profiles.length < 5 && (
                <Link
                  href="/profiles"
                  className="rounded-full bg-[var(--primary)] px-5 py-2 font-semibold text-white text-sm transition hover:bg-[var(--primary-strong)]"
                >
                  + Adicionar Perfil
                </Link>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {profiles.map((profile) => (
                <div
                  key={profile._id}
                  className="relative rounded-2xl border border-(--border) bg-(--card)/50 p-6 transition-colors hover:border-(--primary)/50"
                >
                  {isEditing === profile._id ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          {editAvatar ? (
                            <img src={editAvatar} alt={editName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-(--primary)/30 to-(--primary)/10 flex items-center justify-center">
                              <span className="text-3xl font-black text-(--primary)">{editName.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <label htmlFor={`edit-name-${profile._id}`} className="block text-sm font-medium mb-1">
                              Nome
                            </label>
                            <input
                              type="text"
                              id={`edit-name-${profile._id}`}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              maxLength={20}
                              className="w-full rounded-lg border border-(--border) bg-[var(--background)] px-4 py-2 text-[var(--foreground)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`edit-kid-${profile._id}`}
                              checked={editIsKid}
                              onChange={(e) => setEditIsKid(e.target.checked)}
                              className="w-5 h-5 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
                            />
                            <label htmlFor={`edit-kid-${profile._id}`} className="text-sm">
                              Perfil infantil
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Avatar</label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {AVATARS.map((avatar, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setEditAvatar(avatar)}
                              className={`flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                                editAvatar === avatar
                                  ? "border-(--primary) ring-2 ring-(--primary)/30"
                                  : "border-transparent hover:border-(--border)"
                              }`}
                            >
                              <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 rounded-full border border-(--border) bg-transparent py-2 font-semibold text-[var(--foreground)] transition-colors hover:bg-(--card)"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveProfile(profile._id)}
                          disabled={isLoading}
                          className="flex-1 rounded-full bg-[var(--primary)] py-2 font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-50"
                        >
                          {isLoading ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-(--primary)/30 to-(--primary)/10 flex items-center justify-center">
                              <span className="text-3xl font-black text-(--primary)">{profile.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          {profile.isKid && (
                            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold" title="Perfil infantil">
                              👶
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold truncate">{profile.name}</h3>
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {profile.isKid ? "Perfil infantil" : "Perfil padrão"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(profile)}
                            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-(--card) transition-colors"
                            aria-label={`Editar ${profile.name}`}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          {profiles.length > 1 && (
                            <button
                              onClick={() => handleDeleteProfile(profile._id)}
                              disabled={isLoading}
                              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              aria-label={`Excluir ${profile.name}`}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {selectedProfile?._id === profile._id && (
                        <div className="mt-4 pt-4 border-t border-(--border) flex items-center gap-2 text-sm text-(--primary)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Perfil ativo
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              {profiles.length === 0 && (
                <div className="col-span-2 text-center py-12 text-[var(--muted)]">
                  <svg className="mx-auto mb-4 w-12 h-12 text-[var(--muted)]/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <p className="text-lg">Nenhum perfil encontrado</p>
                  <Link href="/profiles" className="mt-4 inline-block text-(--primary) hover:underline">
                    Criar seu primeiro perfil
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Conta Tab */}
        {activeTab === "account" && (
          <section aria-labelledby="account-heading">
            <h2 id="account-heading" className="text-2xl font-bold mb-6">
              Informações da Conta
            </h2>

            <form onSubmit={handleUpdateAccount} className="space-y-6 max-w-xl">
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  id="accountName"
                  name="name"
                  defaultValue={user.name}
                  className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Avatar da conta</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-(--primary)/30 to-(--primary)/10 flex items-center justify-center">
                        <span className="text-3xl font-black text-(--primary)">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      name="avatar"
                      placeholder="URL do avatar (opcional)"
                      defaultValue={user.avatar || ""}
                      className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
                    />
                    <p className="mt-1 text-sm text-[var(--muted)]">Cole uma URL de imagem (ex: Gravatar, DiceBear, etc.)</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-(--border) bg-(--card)/50 p-6">
                <h3 className="font-semibold mb-4">Email da conta</h3>
                <p className="text-[var(--foreground)]">{user.email}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Para alterar seu email, entre em contato com o suporte.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full max-w-xs rounded-full bg-[var(--primary)] py-3 font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-50"
              >
                {isLoading ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>
          </section>
        )}

        {/* Senha Tab */}
        {activeTab === "password" && (
          <section aria-labelledby="password-heading">
            <h2 id="password-heading" className="text-2xl font-bold mb-6">
              Alterar Senha
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                  Senha atual
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  Nova senha
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
                />
                <p className="mt-1 text-xs text-[var(--muted)]">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-(--border) bg-(--card) px-4 py-3 text-[var(--foreground)] focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full max-w-xs rounded-full bg-[var(--primary)] py-3 font-bold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-50"
              >
                {isLoading ? "Alterando..." : "Alterar senha"}
              </button>
            </form>
          </section>
        )}

        {/* Danger Zone */}
        <section className="mt-16 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Área de Perigo
          </h3>
          <p className="text-[var(--muted)] mb-4">Ações irreversíveis</p>
          <button
            onClick={handleLogout}
            className="rounded-full border border-red-500/30 bg-transparent px-5 py-2.5 font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            Sair da conta
          </button>
        </section>
      </div>
    </main>
  );
}