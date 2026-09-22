"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const search = query.trim();

    if (!search) return;

    router.push(`/search?q=${encodeURIComponent(search)}`);
  }

  function handleOpen() {
    setOpen(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center"
    >
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Abrir busca"
        className="text-white transition hover:text-gray-300"
      >
        🔍
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "ml-2 w-48 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input
          autoFocus={open}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Títulos, pessoas, gêneros"
          className="w-48 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500"
        />
      </div>
    </form>
  );
}