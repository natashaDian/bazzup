"use server";

import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createBazaarSchema } from "./schema";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PHOTO_BUCKET = "bazaar-images";

export type CreateBazaarState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createBazaarAction(
  _prevState: CreateBazaarState,
  formData: FormData,
): Promise<CreateBazaarState> {
  const user = await requireOrganizer();

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    latitude: String(formData.get("latitude") ?? ""),
    longitude: String(formData.get("longitude") ?? ""),
    eventStartDate: String(formData.get("eventStartDate") ?? ""),
    eventEndDate: String(formData.get("eventEndDate") ?? ""),
    facilities: String(formData.get("facilities") ?? ""),
  };

  const parsed = createBazaarSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key])
        fieldErrors[key] = issue.message;
    }
    return { error: "Please check the fields you filled in.", fieldErrors };
  }

  const bazaar = await prisma.bazaar.create({
    data: {
      organizerId: user.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      address: parsed.data.address,
      city: parsed.data.city,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      eventStartDate: new Date(parsed.data.eventStartDate),
      eventEndDate: new Date(parsed.data.eventEndDate),
      facilities: parsed.data.facilities || null,
      status: "DRAFT",
    },
  });

  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return { error: "Cover photo must be PNG, JPG, or WEBP." };
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return { error: "Cover photo must be under 2MB." };
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${bazaar.id}/cover-${Date.now()}.${extension}`;

    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      await prisma.bazaarImage.create({
        data: { bazaarId: bazaar.id, url: publicUrl },
      });
    }
  }

  redirect(`/organizer/bazaars/${bazaar.id}`);
}
