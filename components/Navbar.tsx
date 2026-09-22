"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");

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

  return (
    <header className="fixed inset-x-0 top-0 z-[100] w-full">
      <nav
        className="
          flex
          h-[68px]
          w-full
          items-center
          border-b
          border-[var(--border)]
          bg-[var(--background)]/90
          px-3
          backdrop-blur-xl
          transition-colors
          duration-500
          sm:h-[70px]
          sm:px-4
          md:h-[74px]
          md:px-8
          lg:px-12
        "
      >
        {/* LOGO */}

        <Link
          href="/"
          className="
            shrink-0
            whitespace-nowrap
            text-[19px]
            font-semibold
            leading-none
            tracking-[-1.2px]
            text-[var(--primary)]
            transition-opacity
            hover:opacity-75
            sm:text-[22px]
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
            gap-2
            overflow-visible
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
                  text-[11px]
                  leading-none
                  transition-colors
                  duration-200
                  sm:text-[12px]
                  md:text-sm
                  ${
                    active
                      ? "text-[var(--foreground)]"
                      : "text-[var(--foreground)]/60"
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
                      bg-[var(--primary)]
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
            gap-2
            sm:gap-3
          "
        >
          {/* BUSCA — DESKTOP */}

          <form
  onSubmit={handleSearch}
  className="
    flex
    h-8
    w-[100px]
    shrink
    items-center
    overflow-hidden
    rounded-full
    border
    border-[var(--border)]
    bg-[var(--card)]/50
    transition-all
    duration-300
    focus-within:border-[var(--primary)]

    sm:h-9
    sm:w-[140px]

    md:h-10
    md:w-[200px]

    lg:w-[250px]
  "
>
  <span
    className="
      flex
      shrink-0
      items-center
      justify-center
      pl-2
      text-[var(--muted)]
      sm:pl-3
    "
    aria-hidden="true"
  >
    <svg
      width="14"
      height="14"
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
      px-2
      text-[10px]
      text-[var(--foreground)]
      outline-none
      placeholder:text-[var(--muted)]

      sm:px-2
      sm:text-xs

      md:text-sm
    "
  />
</form>

          {/* TEMA */}

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}