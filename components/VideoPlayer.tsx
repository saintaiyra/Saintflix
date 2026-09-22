"use client";

import { useRef, useState } from "react";

type VideoPlayerProps = {
  src: string;
  poster?: string;
};

export default function VideoPlayer({
  src,
  poster,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  async function togglePlay() {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      await video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;

    if (!video || !video.duration) return;

    setProgress((video.currentTime / video.duration) * 100);
  }

  function handleSeek(event: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;

    if (!video || !video.duration) return;

    const value = Number(event.target.value);

    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  }

  function toggleMute() {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function toggleFullscreen() {
    const video = videoRef.current;

    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }

  return (
    <div className="group relative aspect-video w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* CONTROLES */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 opacity-0 transition group-hover:opacity-100">

        {/* PROGRESSO */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="mb-4 w-full"
        />

        <div className="flex items-center gap-4">

          <button
            onClick={togglePlay}
            className="text-2xl"
          >
            {playing ? "❚❚" : "▶"}
          </button>

          <button
            onClick={toggleMute}
            className="text-xl"
          >
            {muted ? "🔇" : "🔊"}
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleFullscreen}
            className="text-xl"
          >
            ⛶
          </button>

        </div>
      </div>
    </div>
  );
}