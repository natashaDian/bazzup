"use client";

import { useState, useActionState, useEffect } from "react";
import { X, ImagePlus } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { updateAreaAction, type AreaActionState } from "@/lib/areas";

const initialState: AreaActionState = {};

const VISITOR_PROFILES = [
  "Pelajar & Mahasiswa",
  "Pekerja Kantoran",
  "Keluarga & Anak-anak",
  "Wisatawan",
  "Semua Kalangan",
];

function formatThousands(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseThousands(value: string): string {
  return value.replace(/\D/g, "");
}

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

function splitPeakHours(peakHours: string | null) {
  if (!peakHours) return { start: "", end: "" };
  const [start, end] = peakHours.split("-");
  return { start: start ?? "", end: end ?? "" };
}

function splitCategories(categoryWanted: string | null) {
  if (!categoryWanted) return { selected: [] as string[], other: "" };
  const parts = categoryWanted.split(",").map((c) => c.trim());
  const known = parts.filter((p) =>
    (BUSINESS_CATEGORIES as readonly string[]).includes(p),
  );
  const unknown = parts.filter(
    (p) => !(BUSINESS_CATEGORIES as readonly string[]).includes(p),
  );

  if (unknown.length > 0) {
    return { selected: [...known, "Other"], other: unknown.join(", ") };
  }
  return { selected: known, other: "" };
}

export function AreaEditModal({
  area,
  bazaarId,
  onClose,
}: {
  area: Area;
  bazaarId: string;
  onClose: () => void;
}) {
  const boundAction = updateAreaAction.bind(null, area.id, bazaarId);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState,
  );
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const peak = splitPeakHours(area.peakHours);
  const categories = splitCategories(area.categoryWanted);

  const [form, setForm] = useState({
    name: area.name,
    description: area.description ?? "",
    totalSlot: String(area.totalSlot),
    pricePerSlot: String(area.pricePerSlot),
    categoryWanted: categories.selected,
    categoryWantedOther: categories.other,
    estimatedTraffic:
      area.estimatedTraffic !== null ? String(area.estimatedTraffic) : "",
    visitorProfile: area.visitorProfile ?? "",
    peakHoursStart: peak.start,
    peakHoursEnd: peak.end,
    hasElectricity: area.hasElectricity,
  });

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success]);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(category: string) {
    setForm((prev) => {
      const isSelected = prev.categoryWanted.includes(category);
      if (isSelected) {
        return {
          ...prev,
          categoryWanted: prev.categoryWanted.filter((c) => c !== category),
        };
      }
      if (prev.categoryWanted.length >= 5) return prev;
      return { ...prev, categoryWanted: [...prev.categoryWanted, category] };
    });
  }

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setNewPreviews(Array.from(files).map((file) => URL.createObjectURL(file)));
  }

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <p className="text-base font-medium mb-4">Edit Area</p>

        {state.error && (
          <p className="text-xs text-destructive mb-3">{state.error}</p>
        )}

        <form action={formAction} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Foto Saat Ini
            </label>
            {area.images.length > 0 ? (
              <div className="flex gap-2 mb-2 overflow-x-auto">
                {area.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    className="h-16 w-16 object-cover rounded-md shrink-0"
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-2">
                Belum ada foto.
              </p>
            )}

            <label className="text-xs text-muted-foreground block mb-1">
              Tambah Foto Lagi
            </label>
            <label className="block h-20 border border-dashed border-secondary rounded-lg flex items-center justify-center gap-2 bg-secondary/10 cursor-pointer text-accent text-xs overflow-x-auto px-2">
              {newPreviews.length > 0 ? (
                <div className="flex gap-2">
                  {newPreviews.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-14 w-14 object-cover rounded-md"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <ImagePlus className="size-4" />
                  Unggah Foto
                </>
              )}
              <input
                type="file"
                name="photos"
                accept="image/*"
                multiple
                onChange={handlePhotosChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Nama Area *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              rows={2}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Total Slot *
              </label>
              <input
                name="totalSlot"
                type="number"
                min={1}
                value={form.totalSlot}
                onChange={(e) => updateField("totalSlot", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
              />
              {state.fieldErrors?.totalSlot && (
                <p className="text-xs text-destructive mt-1">
                  {state.fieldErrors.totalSlot}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Harga per Slot *
              </label>
              <input
                name="pricePerSlot"
                type="number"
                min={1}
                value={form.pricePerSlot}
                onChange={(e) => updateField("pricePerSlot", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
              />
              {state.fieldErrors?.pricePerSlot && (
                <p className="text-xs text-destructive mt-1">
                  {state.fieldErrors.pricePerSlot}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Kategori yang Diinginkan *{" "}
              <span className="text-muted-foreground">
                ({form.categoryWanted.length}/5)
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {BUSINESS_CATEGORIES.map((category) => {
                const checked = form.categoryWanted.includes(category);
                return (
                  <label
                    key={category}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer ${
                      checked
                        ? "bg-accent/10 border-accent text-accent"
                        : "border-input text-muted-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="categoryWanted"
                      value={category}
                      checked={checked}
                      onChange={() => toggleCategory(category)}
                      className="size-4"
                    />
                    {category}
                  </label>
                );
              })}
            </div>

            {form.categoryWanted.includes("Other") && (
              <input
                name="categoryWantedOther"
                value={form.categoryWantedOther}
                onChange={(e) =>
                  updateField("categoryWantedOther", e.target.value)
                }
                placeholder="Sebutkan kategori lainnya"
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
              />
            )}

            {state.fieldErrors?.categoryWanted && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.categoryWanted}
              </p>
            )}
            {state.fieldErrors?.categoryWantedOther && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.categoryWantedOther}
              </p>
            )}
          </div>

          <p className="text-xs font-medium text-primary uppercase tracking-wide pt-1">
            Detail Skor Kecocokan
          </p>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Perkiraan Pengunjung per Hari *
            </label>
            <input
              name="estimatedTraffic"
              type="number"
              min={0}
              value={form.estimatedTraffic}
              onChange={(e) => updateField("estimatedTraffic", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
            {state.fieldErrors?.estimatedTraffic && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.estimatedTraffic}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Profil Pengunjung *
            </label>
            <select
              name="visitorProfile"
              value={form.visitorProfile}
              onChange={(e) => updateField("visitorProfile", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            >
              <option value="">Pilih profil pengunjung</option>
              {VISITOR_PROFILES.map((profile) => (
                <option key={profile} value={profile}>
                  {profile}
                </option>
              ))}
            </select>
            {state.fieldErrors?.visitorProfile && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.visitorProfile}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Jam Ramai *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  name="peakHoursStart"
                  type="time"
                  value={form.peakHoursStart}
                  onChange={(e) =>
                    updateField("peakHoursStart", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
                />
                {state.fieldErrors?.peakHoursStart && (
                  <p className="text-xs text-destructive mt-1">
                    {state.fieldErrors.peakHoursStart}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="peakHoursEnd"
                  type="time"
                  value={form.peakHoursEnd}
                  onChange={(e) => updateField("peakHoursEnd", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
                />
                {state.fieldErrors?.peakHoursEnd && (
                  <p className="text-xs text-destructive mt-1">
                    {state.fieldErrors.peakHoursEnd}
                  </p>
                )}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <input
              type="checkbox"
              name="hasElectricity"
              checked={form.hasElectricity}
              onChange={(e) => updateField("hasElectricity", e.target.checked)}
              className="size-4"
            />
            Tersedia Listrik
          </label>

          <div className="flex gap-2 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary/15 text-muted-foreground px-4 py-2 rounded-lg text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
