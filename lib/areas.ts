"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAreaSchema } from "@/lib/area-schema";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PHOTO_BUCKET = "bazaar-images";

export type AreaActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

async function assertOwnership(bazaarId: string, organizerId: string) {
  const bazaar = await prisma.bazaar.findUnique({ where: { id: bazaarId } });
  if (!bazaar || bazaar.organizerId !== organizerId) {
    throw new Error("Bazaar not found");
  }
  return bazaar;
}

export async function getBazaarWithAreas(bazaarId: string) {
  const user = await requireOrganizer();
  const bazaar = await prisma.bazaar.findUnique({
    where: { id: bazaarId },
    include: {
      images: true,
      areas: { include: { images: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!bazaar || bazaar.organizerId !== user.id) {
    return null;
  }
  return bazaar;
}

export async function createAreaAction(
  bazaarId: string,
  _prevState: AreaActionState,
  formData: FormData,
): Promise<AreaActionState> {
  const user = await requireOrganizer();
  await assertOwnership(bazaarId, user.id);

  const raw = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    totalSlot: String(formData.get("totalSlot") ?? ""),
    pricePerSlot: String(formData.get("pricePerSlot") ?? ""),
    categoryWanted: formData.getAll("categoryWanted") as string[],
    categoryWantedOther: String(formData.get("categoryWantedOther") ?? ""),
    estimatedTraffic: String(formData.get("estimatedTraffic") ?? ""),
    visitorProfile: String(formData.get("visitorProfile") ?? ""),
    peakHoursStart: String(formData.get("peakHoursStart") ?? ""),
    peakHoursEnd: String(formData.get("peakHoursEnd") ?? ""),
    hasElectricity: formData.get("hasElectricity") === "on",
  };

  const parsed = createAreaSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key])
        fieldErrors[key] = issue.message;
    }
    return { error: "Please check the fields you filled in.", fieldErrors };
  }

  const area = await prisma.area.create({
    data: {
      bazaarId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      totalSlot: parsed.data.totalSlot,
      pricePerSlot: parsed.data.pricePerSlot,
      categoryWanted: parsed.data.categoryWanted
        .map((c) => (c === "Other" ? parsed.data.categoryWantedOther : c))
        .join(", "),
      estimatedTraffic: parsed.data.estimatedTraffic,
      visitorProfile: parsed.data.visitorProfile,
      peakHours: `${parsed.data.peakHoursStart}-${parsed.data.peakHoursEnd}`,
      hasElectricity: parsed.data.hasElectricity ?? false,
    },
  });

  const files = formData.getAll("photos") as File[];
  const supabase = await createClient();

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) continue;
    if (file.size > MAX_PHOTO_SIZE) continue;

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${area.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      await prisma.areaImage.create({
        data: { areaId: area.id, url: publicUrl },
      });
    }
  }

  revalidatePath(`/organizer/bazaars/${bazaarId}`);
  return { success: "Area added." };
}

export async function publishBazaarAction(bazaarId: string) {
  const user = await requireOrganizer();
  const bazaar = await assertOwnership(bazaarId, user.id);

  const areaCount = await prisma.area.count({ where: { bazaarId } });
  if (areaCount === 0) {
    return { error: "Add at least one area before publishing." };
  }

  await prisma.bazaar.update({
    where: { id: bazaarId },
    data: { status: "ACTIVE" },
  });

  revalidatePath(`/organizer/bazaars/${bazaarId}`);
  return { success: true };
}

export async function updateAreaAction(
  areaId: string,
  bazaarId: string,
  _prevState: AreaActionState,
  formData: FormData,
): Promise<AreaActionState> {
  const user = await requireOrganizer();
  const bazaar = await assertOwnership(bazaarId, user.id);

  if (bazaar.status !== "DRAFT") {
    return { error: "Areas can no longer be edited after publishing." };
  }

  const existing = await prisma.area.findUnique({ where: { id: areaId } });
  if (!existing || existing.bazaarId !== bazaarId) {
    return { error: "Area not found." };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    totalSlot: String(formData.get("totalSlot") ?? ""),
    pricePerSlot: String(formData.get("pricePerSlot") ?? ""),
    categoryWanted: formData.getAll("categoryWanted") as string[],
    categoryWantedOther: String(formData.get("categoryWantedOther") ?? ""),
    estimatedTraffic: String(formData.get("estimatedTraffic") ?? ""),
    visitorProfile: String(formData.get("visitorProfile") ?? ""),
    peakHoursStart: String(formData.get("peakHoursStart") ?? ""),
    peakHoursEnd: String(formData.get("peakHoursEnd") ?? ""),
    hasElectricity: formData.get("hasElectricity") === "on",
  };

  const parsed = createAreaSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key])
        fieldErrors[key] = issue.message;
    }
    return { error: "Please check the fields you filled in.", fieldErrors };
  }

  await prisma.area.update({
    where: { id: areaId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      totalSlot: parsed.data.totalSlot,
      pricePerSlot: parsed.data.pricePerSlot,
      categoryWanted: parsed.data.categoryWanted
        .map((c) => (c === "Other" ? parsed.data.categoryWantedOther : c))
        .join(", "),
      estimatedTraffic: parsed.data.estimatedTraffic,
      visitorProfile: parsed.data.visitorProfile,
      peakHours: `${parsed.data.peakHoursStart}-${parsed.data.peakHoursEnd}`,
      hasElectricity: parsed.data.hasElectricity ?? false,
    },
  });

  const files = formData.getAll("photos") as File[];
  if (files.some((f) => f instanceof File && f.size > 0)) {
    const supabase = await createClient();
    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) continue;
      if (file.size > MAX_PHOTO_SIZE) continue;

      const extension =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";
      const path = `${areaId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
        await prisma.areaImage.create({ data: { areaId, url: publicUrl } });
      }
    }
  }

  revalidatePath(`/organizer/bazaars/${bazaarId}`);
  return { success: "Area updated." };
}

export async function deleteAreaAction(areaId: string, bazaarId: string) {
  const user = await requireOrganizer();
  const bazaar = await assertOwnership(bazaarId, user.id);

  if (bazaar.status !== "DRAFT") {
    return { error: "Areas can no longer be deleted after publishing." };
  }

  const existing = await prisma.area.findUnique({ where: { id: areaId } });
  if (!existing || existing.bazaarId !== bazaarId) {
    return { error: "Area not found." };
  }

  await prisma.area.delete({ where: { id: areaId } });
  revalidatePath(`/organizer/bazaars/${bazaarId}`);
  return { success: true };
}
