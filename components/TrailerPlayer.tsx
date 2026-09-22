"use client";

interface TrailerPlayerProps {
  videoKey: string;
}

export default function TrailerPlayer({
  videoKey,
}: TrailerPlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoKey}`}
        title="Trailer"
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}