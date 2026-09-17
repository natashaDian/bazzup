"use client";

import { useState, useActionState, useEffect } from "react";
import { X, ImagePlus } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { useFormDraft } from "@/hooks/use-form-draft";
import { createAreaAction, type AreaActionState } from "@/lib/areas";

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

type AreaDraft = {
  name: string;
  description: string;
  totalSlot: string;
  pricePerSlot: string;
  categoryWanted: string[];
  categoryWantedOther: string;
  estimatedTraffic: string;
  visitorProfile: string;
  peakHoursStart: string;
  peakHoursEnd: string;
  hasElectricity: boolean;
};

const emptyForm: AreaDraft = {
  name: "",
  description: "",
  totalSlot: "",
  pricePerSlot: "",
  categoryWanted: [],
  categoryWantedOther: "",
  estimatedTraffic: "",
  visitorProfile: "",
  peakHoursStart: "",
  peakHoursEnd: "",
  hasElectricity: false,
};

export function AreaFormModal({
  bazaarId,
  onClose,
}: {
  bazaarId: string;
  onClose: () => void;
}) {
  const boundAction = createAreaAction.bind(null, bazaarId);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState,
  );
  const [previews, setPreviews] = useState<string[]>([]);
  const {
    data: form,
    setData: setForm,
    clearDraft,
    loaded: draftLoaded,
  } = useFormDraft<AreaDraft>("draft-area", emptyForm);

  useEffect(() => {
    if (state.success) {
      clearDraft();
      onClose();
    }
  }, [state.success]);

  function updateField<K extends keyof AreaDraft>(
    key: K,
    value: AreaDraft[K],
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
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  }

  const hasDraftContent =
    draftLoaded &&
    (form.name.trim() !== "" ||
      form.description.trim() !== "" ||
      form.totalSlot !== "" ||
      form.pricePerSlot !== "" ||
      form.categoryWanted.length > 0 ||
      form.estimatedTraffic !== "" ||
      form.visitorProfile !== "" ||
      form.peakHoursStart !== "" ||
      form.peakHoursEnd !== "");

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground"
        >
          <X className="size-4" />
        </button>

        <p className="text-base font-medium mb-4">Tambah Area</p>

        {state.error && (
          <p className="text-xs text-destructive mb-3">{state.error}</p>
        )}

        <form action={formAction} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Foto
            </label>
            <label className="block h-24 border border-dashed border-secondary rounded-lg flex items-center justify-center gap-2 bg-secondary/10 cursor-pointer text-accent text-xs overflow-x-auto px-2">
              {previews.length > 0 ? (
                <div className="flex gap-2">
                  {previews.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="h-16 w-16 object-cover rounded-md"
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
              placeholder="misalnya: dekat pintu masuk utama"
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
                type="text"
                inputMode="numeric"
                value={formatThousands(form.pricePerSlot)}
                onChange={(e) =>
                  updateField("pricePerSlot", parseThousands(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
              />
              <input
                type="hidden"
                name="pricePerSlot"
                value={form.pricePerSlot}
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
              placeholder="500"
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
              {isPending ? "Menyimpan..." : "Simpan Area"}
            </button>
          </div>
        </form>

        {hasDraftContent && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Draft tersimpan otomatis di browser ini.
          </p>
        )}
      </div>
    </div>
  );
}
