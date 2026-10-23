"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, selectedProfile, isAuthenticated, logout, selectProfile } = useAuth();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { href: "/", label: "Início" },
    { href: "/discover", label: "Descobrir" },
    { href: "/minha-lista", label: "Minha Lista" },
  ];

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const search = query.trim();

    if (!search) return;

    router.push(`/search?q=${encodeURIComponent(search)}`);
  }

  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  const handleProfileSelect = (profileId: string) => {
    selectProfile(profileId);
    setIsProfileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-100 w-full">
      <nav
        className={`
          flex
          h-14
          w-full
          items-center
          border-b
          border-(--border)
          px-3
          transition-all
          duration-500

          ${
            scrolled
              ? "bg-transparent backdrop-blur-none"
              : "bg-(--background)/90 backdrop-blur-xl"
          }

          sm:h-16
          sm:px-4
          md:h-18
          md:px-8
          lg:px-12
        `}
      >
        {/* LOGO */}

        <Link
          href="/"
          className="
            shrink-0
            whitespace-nowrap
            text-[17px]
            font-semibold
            leading-none
            tracking-[-1px]
            text-(--primary)
            transition-opacity
            hover:opacity-75

            sm:text-[21px]
            md:text-[26px]
            lg:text-[29px]
          "
        >
          SAINTFLIX
        </Link>

        {/* NAVEGAÇÃO */}

        <div
          className="
            ml-3
            flex
            min-w-0
            shrink
            items-center
            gap-1.5

            sm:ml-5
            sm:gap-3

            md:ml-8
            md:gap-7
          "
        >
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative
                  whitespace-nowrap
                  py-2
                  leading-none
                  transition-colors
                  duration-200

                  text-[9px]

                  sm:text-[11px]
                  md:text-sm

                  ${
                    active
                      ? "text-foreground"
                      : "text-(--foreground)/60"
                  }
                `}
              >
                {link.label}

                {active && (
                  <span
                    className="
                      absolute
                      -bottom-1
                      left-0
                      h-px
                      w-full
                      bg-(--primary)
                    "
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* ÁREA DIREITA */}

        <div
          className="
            ml-auto
            flex
            shrink-0
            items-center
            gap-1.5

            sm:gap-2

            md:gap-3
          "
        >
          {/* BUSCA */}

          <form
            onSubmit={handleSearch}
            className="
              flex
              h-7
              w-20
              shrink
              items-center
              overflow-hidden
              rounded-full
              border
              border-(--border)
              bg-(--card)/50
              transition-all
              duration-300
              focus-within:border-(--primary)

              sm:h-8
              sm:w-32

              md:h-10
              md:w-50

              lg:w-62.5
            "
          >
            <span
              className="
                flex
                shrink-0
                items-center
                justify-center
                pl-2
                text-(--muted)

                sm:pl-3
              "
              aria-hidden="true"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar..."
              className="
                h-full
                w-full
                min-w-0
                bg-transparent
                px-1.5
                text-[9px]
                text-foreground
                outline-none
                placeholder:text-(--muted)

                sm:px-2
                sm:text-xs

                md:text-sm
              "
            />
          </form>

          {/* TEMA */}

          <div
            className="
              scale-75

              sm:scale-90
              md:scale-100
            "
          >
            <ThemeToggle />
          </div>

          {/* AUTH / PERFIL */}

          <div className="relative" ref={profileMenuRef}>
            {isAuthenticated && selectedProfile ? (
              <>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-(--card)/50 transition-colors"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                  aria-label={`Perfil: ${selectedProfile.name}`}
                >
                  <div className="relative w-8 h-8 flex-shrink-0">
                    {selectedProfile.avatar ? (
                      <img
                        src={selectedProfile.avatar}
                        alt={selectedProfile.name}
                        className="w-full h-full rounded-full object-cover ring-2 ring-(--primary)/30"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-(--primary)/30 to-(--primary)/10 flex items-center justify-center">
                        <span className="text-[12px] font-black text-(--primary)">
                          {selectedProfile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {selectedProfile.isKid && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px] font-bold">
                        👶
                      </span>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-(--border) bg-[var(--card)] shadow-2xl overflow-hidden animate-slide-down z-50">
                    {/* Perfil atual */}
                    <div className="p-3 border-b border-(--border)">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex-shrink-0">
                          {selectedProfile.avatar ? (
                            <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-(--primary)/30 to-(--primary)/10 flex items-center justify-center">
                              <span className="text-xl font-black text-(--primary)">{selectedProfile.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{selectedProfile.name}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {selectedProfile.isKid ? "Perfil infantil" : "Perfil padrão"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Trocar perfil */}
                    {user?.profiles && user.profiles.length > 1 && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                          Trocar Perfil
                        </div>
                        <div className="divide-y divide-(--border)">
                          {user.profiles
                            .filter((p) => p._id !== selectedProfile._id)
                            .map((profile) => (
                              <button
                                key={profile._id}
                                onClick={() => handleProfileSelect(profile._id)}
                                className="w-full px-3 py-3 flex items-center gap-3 hover:bg-(--card)/50 transition-colors text-left"
                              >
                                <div className="relative w-8 h-8 flex-shrink-0">
                                  {profile.avatar ? (
                                    <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-(--primary)/30 to-(--primary)/10 flex items-center justify-center">
                                      <span className="text-sm font-black text-(--primary)">{profile.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                  )}
                                  {profile.isKid && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center text-white text-[6px] font-bold">
                                      👶
                                    </span>
                                  )}
                                </div>
                                <span className="font-medium truncate">{profile.name}</span>
                              </button>
                            ))}
                        </div>
                      </>
                    )}

                    <div className="divide-y divide-(--border)">
                      <Link
                        href="/conta"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full px-3 py-3 flex items-center gap-3 hover:bg-(--card)/50 transition-colors text-left text-[var(--foreground)]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted)]">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                        <span>Gerenciar Perfis</span>
                      </Link>

                      <Link
                        href="/conta"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full px-3 py-3 flex items-center gap-3 hover:bg-(--card)/50 transition-colors text-left text-[var(--foreground)]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--muted)]">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Conta</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-3 flex items-center gap-3 hover:bg-(--card)/50 transition-colors text-left text-red-400"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="hidden sm:block rounded-full border border-(--border) px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-(--primary) hover:text-(--primary)"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--primary-strong)]"
                >
                  Assine já
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}