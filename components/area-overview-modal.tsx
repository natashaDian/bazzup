"use client";

import { useState } from "react";
import {
  X,
  Zap,
  Users,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

type AreaImage = { id: string; url: string };
type Area = {
  id: string;
  name: string;
  description: string | null;
  totalSlot: number;
  pricePerSlot: number;
  categoryWanted: string | null;
  estimatedTraffic: number | null;
  visitorProfile: string | null;
  peakHours: string | null;
  hasElectricity: boolean;
  images: AreaImage[];
};

export function AreaOverviewModal({
  area,
  onClose,
}: {
  area: Area;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const hasImages = area.images.length > 0;

  function prevImage() {
    setActiveImage((i) => (i === 0 ? area.images.length - 1 : i - 1));
  }

  function nextImage() {
    setActiveImage((i) => (i === area.images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-card/90 rounded-full p-1.5 text-foreground"
          aria-label="Tutup"
        >
          <X className="size-4" />
        </button>

        <div className="relative h-72 bg-secondary/10 flex items-center justify-center">
          {hasImages ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={area.images[activeImage].url}
                alt={area.name}
                className="size-full object-contain"
              />
              {area.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 rounded-full p-1.5"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/90 rounded-full p-1.5"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {area.images.map((_, i) => (
                      <span
                        key={i}
                        className={`size-1.5 rounded-full ${i === activeImage ? "bg-white" : "bg-white/40"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <ImageIcon className="size-8 text-secondary" />
          )}
        </div>

        <div className="p-6">
          <h2 className="text-lg font-medium mb-1">{area.name}</h2>
          {area.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {area.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-secondary/10 rounded-xl p-3.5">
              <p className="text-xs text-muted-foreground mb-1">Total Slot</p>
              <p className="text-base font-medium">{area.totalSlot}</p>
            </div>
            <div className="bg-secondary/10 rounded-xl p-3.5">
              <p className="text-xs text-muted-foreground mb-1">
                Harga per Slot
              </p>
              <p className="text-base font-medium">
                Rp {area.pricePerSlot.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {area.categoryWanted && (
            <span className="inline-block text-xs bg-secondary/15 text-accent px-2.5 py-1 rounded-full mb-4">
              {area.categoryWanted}
            </span>
          )}

          <div className="space-y-3 border-t border-secondary/15 pt-4">
            {area.estimatedTraffic !== null && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <TrendingUp className="size-4 text-accent shrink-0" />
                <span>~{area.estimatedTraffic} pengunjung per hari</span>
              </div>
            )}
            {area.visitorProfile && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Users className="size-4 text-accent shrink-0" />
                <span>{area.visitorProfile}</span>
              </div>
            )}
            {area.peakHours && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="size-4 text-accent shrink-0" />
                <span>Jam ramai: {area.peakHours}</span>
              </div>
            )}
            {area.hasElectricity && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Zap className="size-4 text-accent shrink-0" />
                <span>Tersedia Listrik</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
