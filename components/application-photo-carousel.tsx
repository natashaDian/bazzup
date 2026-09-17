"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export function ApplicationPhotoCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative h-28 rounded-lg bg-muted overflow-hidden flex items-center justify-center mb-2.5">
        <ImageIcon className="size-5 text-muted-foreground" />
      </div>
    );
  }

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div
      className="relative h-28 rounded-lg bg-muted overflow-hidden mb-2.5"
      onClick={(e) => e.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[index]} alt="" className="size-full object-cover" />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Foto sebelumnya"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-white flex items-center justify-center"
          >
            <ChevronLeft className="size-3" />
          </button>
          <button
            onClick={next}
            aria-label="Foto berikutnya"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-white flex items-center justify-center"
          >
            <ChevronRight className="size-3" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`size-1 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
