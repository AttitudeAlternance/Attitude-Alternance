"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface GuideImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export function GuideImage({ src, alt, width, height }: GuideImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Agrandir l'image : ${alt}`}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-line bg-white shadow-card"
      >
        <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-150 group-hover:bg-ink/20 group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-pop">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3M11 8v6M8 11h6" strokeLinecap="round" />
            </svg>
          </span>
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
            <img
              src={src}
              alt={alt}
              className="relative z-0 max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>,
          document.body
        )}
    </>
  );
}
