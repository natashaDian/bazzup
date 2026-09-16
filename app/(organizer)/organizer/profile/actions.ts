"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PHOTO_BUCKET = "vendor-profiles";

export type UpdateOrganizerProfileState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

async function uploadPhoto(
  userId: string,
  file: File,
  prefix: string,
): Promise<string | null> {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return null;
  if (file.size > MAX_PHOTO_SIZE) return null;

  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${userId}/${prefix}-${Date.now()}.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return null;

  const {
    data: { publicUrl },
  } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return publicUrl;
}

export async function updateOrganizerProfileAction(
  _prevState: UpdateOrganizerProfileState,
  formData: FormData,
): Promise<UpdateOrganizerProfileState> {
  const user = await requireOrganizer();

  const businessName = String(formData.get("businessName") ?? "").trim();
  const businessDesc = String(formData.get("businessDesc") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const tiktok = String(formData.get("tiktok") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  const fieldErrors: Record<string, string> = {};

  if (!businessName || businessName.length < 2) {
    fieldErrors.businessName =
      "Organization name must be at least 2 characters.";
  }

  if (!whatsapp) {
    fieldErrors.whatsapp = "WhatsApp number is required.";
  } else if (!/^0\d{9,13}$/.test(whatsapp)) {
    fieldErrors.whatsapp =
      "Enter a valid number starting with 0 (e.g. 0812xxxxxxx).";
  }

  if (phone && !/^0\d{9,13}$/.test(phone)) {
    fieldErrors.phone = "Enter a valid phone number starting with 0.";
  }

  if (website && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(website)) {
    fieldErrors.website = "Enter a valid website (e.g. example.com).";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please check the fields you filled in.", fieldErrors };
  }

  const updateData: Record<string, string | null> = {
    businessName,
    businessDesc: businessDesc || null,
    phone: phone || null,
    whatsapp,
    instagram: instagram || null,
    tiktok: tiktok || null,
    website: website || null,
  };

  const removePhoto = formData.get("removePhoto") === "true";
  if (removePhoto) updateData.profileImageUrl = null;

  const removeCoverPhoto = formData.get("removeCoverPhoto") === "true";
  if (removeCoverPhoto) updateData.coverImageUrl = null;

  const photoFile = formData.get("photo");
  if (photoFile instanceof File && photoFile.size > 0) {
    const url = await uploadPhoto(user.id, photoFile, "organizer-profile");
    if (!url)
      return {
        error: "Failed to upload profile photo. Check the file type and size.",
      };
    updateData.profileImageUrl = url;
  }

  const coverPhotoFile = formData.get("coverPhoto");
  if (coverPhotoFile instanceof File && coverPhotoFile.size > 0) {
    const url = await uploadPhoto(user.id, coverPhotoFile, "organizer-cover");
    if (!url)
      return {
        error: "Failed to upload cover photo. Check the file type and size.",
      };
    updateData.coverImageUrl = url;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  revalidatePath("/organizer/profile");
  return { success: true };
}
