"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { LocationPicker } from "@/components/location-picker";
import { createBazaarAction, type CreateBazaarState } from "./actions";

const initialState: CreateBazaarState = {};

const FACILITY_OPTIONS = ["Meja", "Kursi", "Rak", "Karpet", "Tripod"];

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
  const [facilities, setFacilities] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventStartDate: "",
    eventEndDate: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state.fieldErrors) setFieldErrors(state.fieldErrors);
  }, [state]);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function toggleFacility(facility: string) {
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  }

  function validateClientSide() {
    const errors: Record<string, string> = {};
    if (!form.title.trim() || form.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }
    if (!form.description.trim() || form.description.trim().length < 100) {
      errors.description = "Description must be at least 100 characters";
    }
    if (!form.eventStartDate) {
      errors.eventStartDate = "Start date is required";
    }
    if (!form.eventEndDate) {
      errors.eventEndDate = "End date is required";
    } else if (
      form.eventStartDate &&
      new Date(form.eventEndDate) < new Date(form.eventStartDate)
    ) {
      errors.eventEndDate = "End date must be on or after the start date";
    }
    return errors;
  }

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
        <h1 className="text-lg font-medium">Create new bazaar</h1>
        <p className="text-sm text-muted-foreground mb-5">
          Fill in the event details to create a new bazaar.
        </p>

        <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">
              <div className="h-28 border border-dashed border-secondary rounded-lg flex flex-col items-center justify-center text-accent bg-secondary/10 cursor-pointer overflow-hidden">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Cover preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="size-5 mb-1.5" />
                    <span className="text-xs">Upload cover photo</span>
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
            Basic information
          </p>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Enter bazaar title"
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
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              placeholder="Tell people about your bazaar (minimum 100 characters)"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {form.description.trim().length}/100 characters minimum
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
                Start date *
              </label>
              <input
                type="date"
                name="eventStartDate"
                value={form.eventStartDate}
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
                End date *
              </label>
              <input
                type="date"
                name="eventEndDate"
                value={form.eventEndDate}
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
            Location
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
            Facilities
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FACILITY_OPTIONS.map((facility) => (
              <label
                key={facility}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-card text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={facilities.includes(facility)}
                  onChange={() => toggleFacility(facility)}
                  className="accent-accent"
                />
                {facility}
              </label>
            ))}
          </div>
          <input type="hidden" name="facilities" value={facilities.join(",")} />

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-secondary/15 text-muted-foreground px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm"
            >
              {isPending ? "Saving..." : "Save as draft"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
