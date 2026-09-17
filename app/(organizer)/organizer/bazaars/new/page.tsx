"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { LocationPicker } from "@/components/location-picker";
import { useFormDraft } from "@/hooks/use-form-draft";
import { createBazaarAction, type CreateBazaarState } from "./actions";

const initialState: CreateBazaarState = {};

const FACILITY_OPTIONS = ["Meja", "Kursi", "Rak", "Karpet", "Tripod"];

type BazaarDraft = {
  title: string;
  description: string;
  eventStartDate: string;
  eventEndDate: string;
  facilities: string[];
};

const EMPTY_DRAFT: BazaarDraft = {
  title: "",
  description: "",
  eventStartDate: "",
  eventEndDate: "",
  facilities: [],
};

export default function CreateBazaarPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createBazaarAction,
    initialState,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [locationData, setLocationData] = useState({
    address: "",
    city: "",
    latitude: -6.2088,
    longitude: 106.8456,
  });

  const {
    data: draft,
    setData: setDraft,
    clearDraft,
    loaded: draftLoaded,
  } = useFormDraft<BazaarDraft>("draft-bazaar", EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state.fieldErrors) setFieldErrors(state.fieldErrors);
  }, [state]);

  const isPendingRef = useRef(isPending);
  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);
  useEffect(() => {
    return () => {
      if (isPendingRef.current) clearDraft();
    };
  }, []);

  function updateField<K extends keyof BazaarDraft>(
    key: K,
    value: BazaarDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function toggleFacility(facility: string) {
    setDraft((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  }

  function validateClientSide() {
    const errors: Record<string, string> = {};
    if (!draft.title.trim() || draft.title.trim().length < 3) {
      errors.title = "Judul minimal harus 3 karakter";
    }
    if (!draft.description.trim() || draft.description.trim().length < 100) {
      errors.description = "Deskripsi minimal harus 100 karakter";
    }
    if (!draft.eventStartDate) {
      errors.eventStartDate = "Tanggal mulai wajib diisi";
    }
    if (!draft.eventEndDate) {
      errors.eventEndDate = "Tanggal selesai wajib diisi";
    } else if (
      draft.eventStartDate &&
      new Date(draft.eventEndDate) < new Date(draft.eventStartDate)
    ) {
      errors.eventEndDate = "Tanggal selesai harus sama dengan atau setelah tanggal mulai";
    }
    return errors;
  }

  const hasDraftContent =
    draftLoaded &&
    (draft.title.trim() !== "" ||
      draft.description.trim() !== "" ||
      draft.eventStartDate !== "" ||
      draft.eventEndDate !== "" ||
      draft.facilities.length > 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors = validateClientSide();
    if (Object.keys(errors).length > 0) {
      e.preventDefault();
      setFieldErrors(errors);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <div className="bg-card rounded-2xl p-6">
        <h1 className="text-lg font-medium">Buat bazaar baru</h1>
        <p className="text-sm text-muted-foreground mb-5">
          Isi detail acara untuk membuat bazaar baru.
        </p>

        <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">
              <div className="h-28 border border-dashed border-secondary rounded-lg flex flex-col items-center justify-center text-accent bg-secondary/10 cursor-pointer overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Pratinjau sampul"
                    className="size-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="size-5 mb-1.5" />
                    <span className="text-xs">Unggah foto sampul</span>
                  </>
                )}
              </div>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Informasi dasar
          </p>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Judul *
            </label>
            <input
              name="title"
              value={draft.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Masukkan judul bazaar"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
            {fieldErrors.title && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Deskripsi *
            </label>
            <textarea
              name="description"
              value={draft.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              placeholder="Ceritakan tentang bazaar Anda (minimal 100 karakter)"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {draft.description.trim().length}/100 karakter minimum
            </p>
            {fieldErrors.description && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Tanggal mulai *
              </label>
              <input
                type="date"
                name="eventStartDate"
                value={draft.eventStartDate}
                onChange={(e) => updateField("eventStartDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
              />
              {fieldErrors.eventStartDate && (
                <p className="text-xs text-destructive mt-1">
                  {fieldErrors.eventStartDate}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Tanggal selesai *
              </label>
              <input
                type="date"
                name="eventEndDate"
                value={draft.eventEndDate}
                onChange={(e) => updateField("eventEndDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
              />
              {fieldErrors.eventEndDate && (
                <p className="text-xs text-destructive mt-1">
                  {fieldErrors.eventEndDate}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Lokasi
          </p>

          <LocationPicker onChange={setLocationData} />

          <input type="hidden" name="address" value={locationData.address} />
          <input type="hidden" name="city" value={locationData.city} />
          <input type="hidden" name="latitude" value={locationData.latitude} />
          <input
            type="hidden"
            name="longitude"
            value={locationData.longitude}
          />

          {fieldErrors.address && (
            <p className="text-xs text-destructive">{fieldErrors.address}</p>
          )}

          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Fasilitas
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FACILITY_OPTIONS.map((facility) => (
              <label
                key={facility}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-card text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={draft.facilities.includes(facility)}
                  onChange={() => toggleFacility(facility)}
                  className="accent-accent"
                />
                {facility}
              </label>
            ))}
          </div>
          <input
            type="hidden"
            name="facilities"
            value={draft.facilities.join(",")}
          />

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-secondary/15 text-muted-foreground px-4 py-2 rounded-lg text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm"
            >
              {isPending ? "Menyimpan..." : "Simpan sebagai Draf"}
            </button>
          </div>
        </form>

        {hasDraftContent && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Draft tersimpan otomatis di browser ini.
          </p>
        )}
      </div>
    </main>
  );
}
