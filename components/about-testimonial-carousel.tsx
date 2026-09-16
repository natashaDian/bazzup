"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon } from "lucide-react";

export type Testimonial = {
  name: string;
  role: string;
  businessName: string;
  quote: string;
};

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function AboutTestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  const current = testimonials[index];

  function goPrev() {
    setIndex((i) => (i === 0 ? total - 1 : i - 1));
  }

  function goNext() {
    setIndex((i) => (i === total - 1 ? 0 : i + 1));
  }

  return (
    <div className="relative flex flex-col justify-between gap-7 rounded-2xl border border-[#E8E1EF] bg-white p-8 shadow-[0_2px_16px_rgba(122,92,168,0.07)] sm:p-10">
      <QuoteIcon className="absolute top-7 right-7 size-9 text-[#B98CDE]/40 sm:top-8 sm:right-8" />

      <div key={index} className="flex flex-col gap-5 duration-200 animate-in fade-in-0">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F3EAFB] text-sm font-semibold text-[#7A5CA8]">
            {initials(current.name)}
          </span>
          <div>
            <p className="font-semibold text-[#3B1F4A]">{current.name}</p>
            <p className="text-sm text-[#6B7280]">
              {current.role} &middot; {current.businessName}
            </p>
          </div>
        </div>

        <p className="max-w-xl text-base leading-relaxed text-[#3B1F4A] sm:text-lg">
          &ldquo;{current.quote}&rdquo;
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-[#EEE4FA] pt-5">
        <p className="text-sm font-medium text-[#6B7280]">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous testimonial"
            className="flex size-9 items-center justify-center rounded-full border border-[#E8E1EF] text-[#3B1F4A] transition-all duration-200 hover:border-[#7A5CA8] hover:text-[#7A5CA8] active:scale-90"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next testimonial"
            className="flex size-9 items-center justify-center rounded-full border border-[#E8E1EF] text-[#3B1F4A] transition-all duration-200 hover:border-[#7A5CA8] hover:text-[#7A5CA8] active:scale-90"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
