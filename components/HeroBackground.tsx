"use client";

import { useTheme } from "./ThemeProvider";

interface HeroBackgroundProps {
  backdropPath: string | null;
  title: string;
}

export default function HeroBackground({
  backdropPath,
  title,
}: HeroBackgroundProps) {
  const { theme } = useTheme();

  if (!backdropPath) {
    return null;
  }

  const imageUrl =
    `https://image.tmdb.org/t/p/original${backdropPath}`;

  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* IMAGEM */}
      <img
        src={imageUrl}
        alt={title}
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center
        "
      />

      {/* GRADIENTE PRINCIPAL */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-r from-[#05030a] via-[#05030a]/65 to-transparent"
            : "bg-gradient-to-r from-white via-white/55 to-transparent"
        }`}
      />

      {/* GRADIENTE INFERIOR */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-t from-[#05030a] via-transparent to-[#05030a]/20"
            : "bg-gradient-to-t from-white via-transparent to-white/10"
        }`}
      />

      {/* LEVE ESCURECIMENTO NO DARK MODE */}
      {isDark && (
        <div className="absolute inset-0 bg-black/10" />
      )}
    </div>
  );
}