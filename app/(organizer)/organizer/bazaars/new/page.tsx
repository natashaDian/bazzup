"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { LocationPicker } from "@/components/location-picker";
import { createBazaarAction, type CreateBazaarState } from "./actions";

const initialState: CreateBazaarState = {};

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

        <form action={formAction} className="space-y-4">
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
              placeholder="Enter bazaar title"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
            />
            {state.fieldErrors?.title && (
              <p className="text-xs text-destructive mt-1">
                {state.fieldErrors.title}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Tell people about your bazaar"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Start date *
              </label>
              <input
                type="date"
                name="eventStartDate"
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
              />
              {state.fieldErrors?.eventStartDate && (
                <p className="text-xs text-destructive mt-1">
                  {state.fieldErrors.eventStartDate}
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
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
              />
              {state.fieldErrors?.eventEndDate && (
                <p className="text-xs text-destructive mt-1">
                  {state.fieldErrors.eventEndDate}
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

          {state.fieldErrors?.address && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.address}
            </p>
          )}
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
