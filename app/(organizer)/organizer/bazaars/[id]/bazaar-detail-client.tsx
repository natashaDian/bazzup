"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MapPin,
  Calendar,
  Zap,
  ImageIcon,
  Layers,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { AreaFormModal } from "@/components/area-form-modal";
import { AreaOverviewModal } from "@/components/area-overview-modal";
import { AreaEditModal } from "@/components/area-edit-modal";
import { AreaDeleteModal } from "@/components/area-delete-modal";
import { publishBazaarAction } from "@/lib/areas";
import { formatDateDisplay } from "@/lib/date";

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
type BazaarImage = { id: string; url: string };
type Bazaar = {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  eventStartDate: Date;
  eventEndDate: Date;
  status: string;
  images: BazaarImage[];
  areas: Area[];
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-secondary/15 text-muted-foreground",
  ACTIVE: "bg-accent/15 text-accent",
  FULL: "bg-secondary/25 text-primary",
  COMPLETED: "bg-secondary/10 text-muted-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  FULL: "Full",
  COMPLETED: "Completed",
};

export function BazaarDetailClient({ bazaar }: { bazaar: Bazaar }) {
  const router = useRouter();
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [overviewArea, setOverviewArea] = useState<Area | null>(null);
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [deleteArea, setDeleteArea] = useState<Area | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [isPublishing, startTransition] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);

  const isDraft = bazaar.status === "DRAFT";

  function handlePublish() {
    setPublishError(null);
    startTransition(async () => {
      const result = await publishBazaarAction(bazaar.id);
      if (result?.error) {
        setPublishError(result.error);
        setShowPublishConfirm(false);
      } else {
        setShowPublishConfirm(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-2xl overflow-hidden">
        <div className="relative h-44 bg-secondary/10 flex items-center justify-center">
          {bazaar.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bazaar.images[0].url}
              alt={bazaar.title}
              className="absolute inset-0 size-full object-contain"
            />
          ) : (
            <ImageIcon className="size-8 text-secondary" />
          )}
          {bazaar.images[0] && (
            <div className="absolute inset-0 bg-foreground/30" />
          )}
          <span
            className={`absolute top-4 left-4 text-xs px-3 py-1 rounded-full ${
              bazaar.images[0]
                ? "bg-card/90 text-primary"
                : (STATUS_STYLE[bazaar.status] ?? STATUS_STYLE.DRAFT)
            }`}
          >
            {STATUS_LABEL[bazaar.status] ?? bazaar.status}
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-medium">{bazaar.title}</h1>
            {isDraft && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm shrink-0"
              >
                Publish bazaar
              </button>
            )}
          </div>

          {publishError && (
            <p className="text-xs text-destructive mb-4 bg-destructive/10 px-3 py-2 rounded-lg">
              {publishError}
            </p>
          )}

          {bazaar.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {bazaar.description}
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground border-t border-secondary/15 pt-4">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 text-accent" />
              {formatDateDisplay(bazaar.eventStartDate)} -{" "}
              {formatDateDisplay(bazaar.eventEndDate)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" />
              {bazaar.address}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-medium">Areas</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bazaar.areas.length}{" "}
              {bazaar.areas.length === 1 ? "area" : "areas"} added
              {!isDraft && " · locked after publishing"}
            </p>
          </div>
          {isDraft && (
            <button
              onClick={() => setShowAreaModal(true)}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3.5 py-2 rounded-lg text-sm"
            >
              <Plus className="size-4" />
              Add area
            </button>
          )}
        </div>

        {bazaar.areas.length === 0 ? (
          <div className="border border-dashed border-secondary/40 rounded-2xl py-14 flex flex-col items-center justify-center text-center bg-card">
            <Layers className="size-7 text-secondary mb-3" />
            <p className="text-sm text-muted-foreground max-w-xs">
              No areas yet. Add at least one area before publishing this bazaar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bazaar.areas.map((area) => (
              <div
                key={area.id}
                className="group relative bg-card rounded-2xl overflow-hidden"
              >
                <div className="h-28 bg-secondary/10 flex items-center justify-center">
                  {area.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={area.images[0].url}
                      alt={area.name}
                      className="size-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="size-6 text-secondary" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium mb-2">{area.name}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{area.totalSlot} slots</span>
                    <span className="font-medium text-foreground">
                      Rp {area.pricePerSlot.toLocaleString("id-ID")} / slot
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {area.categoryWanted && (
                      <span className="text-xs bg-secondary/15 text-accent px-2.5 py-1 rounded-full">
                        {area.categoryWanted}
                      </span>
                    )}
                    {area.hasElectricity && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="size-3.5" /> Electricity
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setOverviewArea(area)}
                    className="flex items-center justify-center bg-card text-accent size-9 rounded-full"
                    aria-label="View details"
                  >
                    <Eye className="size-4" />
                  </button>
                  {isDraft && (
                    <>
                      <button
                        onClick={() => setEditArea(area)}
                        className="flex items-center justify-center bg-card text-accent size-9 rounded-full"
                        aria-label="Edit area"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleteArea(area)}
                        className="flex items-center justify-center bg-card text-destructive size-9 rounded-full"
                        aria-label="Delete area"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAreaModal && (
        <AreaFormModal
          bazaarId={bazaar.id}
          onClose={() => setShowAreaModal(false)}
        />
      )}

      {overviewArea && (
        <AreaOverviewModal
          area={overviewArea}
          onClose={() => setOverviewArea(null)}
        />
      )}

      {editArea && (
        <AreaEditModal
          area={editArea}
          bazaarId={bazaar.id}
          onClose={() => setEditArea(null)}
        />
      )}

      {deleteArea && (
        <AreaDeleteModal
          areaId={deleteArea.id}
          areaName={deleteArea.name}
          bazaarId={bazaar.id}
          onClose={() => setDeleteArea(null)}
        />
      )}

      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-medium mb-2">Publish this bazaar?</h3>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Once published, areas can no longer be edited or deleted. You'll
              only be able to view their details. Make sure everything is
              correct before continuing.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="bg-secondary/15 text-muted-foreground px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm"
              >
                {isPublishing ? "Publishing..." : "Yes, publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
