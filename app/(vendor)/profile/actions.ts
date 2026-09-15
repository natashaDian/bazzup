"use server";

import { revalidatePath } from "next/cache";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { BUSINESS_CATEGORY_OTHER } from "@/lib/constants";
import { vendorProfileSchema } from "./schema";
import { productSchema, portfolioSchema } from "./product-portfolio-schema";

export type UpdateVendorProfileState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateVendorProfileAction(
  _prevState: UpdateVendorProfileState,
  formData: FormData,
): Promise<UpdateVendorProfileState> {
  const user = await requireVendor();

  if (!user.profileImageUrl) {
    return { error: "Logo usaha wajib diupload sebelum menyimpan." };
  }

  const raw = {
    businessName: String(formData.get("businessName") ?? ""),
    businessType: String(formData.get("businessType") ?? ""),
    businessTypeOther: String(formData.get("businessTypeOther") ?? ""),
    businessDesc: String(formData.get("businessDesc") ?? ""),
    targetMarket: String(formData.get("targetMarket") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    tiktok: String(formData.get("tiktok") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = vendorProfileSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: "Periksa kembali data yang kamu isi.", fieldErrors };
  }

  const data = parsed.data;
  const businessType =
    data.businessType === BUSINESS_CATEGORY_OTHER
      ? data.businessTypeOther!.trim()
      : data.businessType;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      businessName: data.businessName,
      businessType,
      businessDesc: data.businessDesc || null,
      targetMarket: data.targetMarket || null,
      phone: data.phone || null,
      instagram: data.instagram || null,
      whatsapp: data.whatsapp || null,
      tiktok: data.tiktok || null,
      website: data.website || null,
    },
  });

  revalidatePath("/profile");

  return { success: "Profil usaha berhasil disimpan." };
}

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PHOTO_BUCKET = "vendor-profiles";

export type UploadBusinessPhotoState = {
  error?: string;
  success?: string;
  url?: string;
};

export async function uploadBusinessPhotoAction(
  _prevState: UploadBusinessPhotoState,
  formData: FormData,
): Promise<UploadBusinessPhotoState> {
  const user = await requireVendor();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih file foto terlebih dahulu." };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: "Format file harus PNG, JPG, atau WEBP." };
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return { error: "Ukuran file maksimal 2MB." };
  }

  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${user.id}/logo-${Date.now()}.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: "Gagal mengunggah foto. Coba lagi." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

  await prisma.user.update({
    where: { id: user.id },
    data: { profileImageUrl: publicUrl },
  });

  revalidatePath("/profile");

  return { success: "Foto usaha berhasil diperbarui.", url: publicUrl };
}

export type ProductActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export async function getVendorProducts() {
  const user = await requireVendor();
  return prisma.product.findMany({
    where: { vendorId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const user = await requireVendor();

  const raw = {
    name: String(formData.get("name") ?? ""),
    price: String(formData.get("price") ?? ""),
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: "Periksa kembali data yang kamu isi.", fieldErrors };
  }

  let imageUrl: string | undefined;
  const file = formData.get("photo");

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return { error: "Format foto harus PNG, JPG, atau WEBP." };
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return { error: "Ukuran foto maksimal 2MB." };
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/product-${Date.now()}.${extension}`;

    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: "Gagal mengunggah foto. Coba lagi." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    imageUrl = publicUrl;
  }

  await prisma.product.create({
    data: {
      vendorId: user.id,
      name: parsed.data.name,
      price: parsed.data.price,
      imageUrl,
    },
  });

  revalidatePath("/profile");
  return { success: "Produk berhasil ditambahkan." };
}

export async function getVendorPortfolios() {
  const user = await requireVendor();
  return prisma.portfolio.findMany({
    where: { vendorId: user.id },
    orderBy: { eventDate: "desc" },
  });
}

export async function createPortfolioAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const user = await requireVendor();

  const raw = {
    bazaarName: String(formData.get("bazaarName") ?? ""),
    eventDate: String(formData.get("eventDate") ?? ""),
  };

  const parsed = portfolioSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { error: "Periksa kembali data yang kamu isi.", fieldErrors };
  }

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "Foto wajib diupload.",
      fieldErrors: { photo: "Pilih foto terlebih dahulu." },
    };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: "Format foto harus PNG, JPG, atau WEBP." };
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return { error: "Ukuran foto maksimal 2MB." };
  }

  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${user.id}/portfolio-${Date.now()}.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { error: "Gagal mengunggah foto. Coba lagi." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

  await prisma.portfolio.create({
    data: {
      vendorId: user.id,
      bazaarName: parsed.data.bazaarName,
      eventDate: new Date(parsed.data.eventDate),
      photoUrl: publicUrl,
    },
  });

  revalidatePath("/profile");
  return { success: "Portofolio berhasil ditambahkan." };
}

export async function updateProductAction(
  id: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const user = await requireVendor();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.vendorId !== user.id) {
    return { error: "Produk tidak ditemukan." };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    price: String(formData.get("price") ?? ""),
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key])
        fieldErrors[key] = issue.message;
    }
    return { error: "Periksa kembali data yang kamu isi.", fieldErrors };
  }

  let imageUrl = existing.imageUrl;
  const file = formData.get("photo");

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return { error: "Format foto harus PNG, JPG, atau WEBP." };
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return { error: "Ukuran foto maksimal 2MB." };
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/product-${Date.now()}.${extension}`;

    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: "Gagal mengunggah foto. Coba lagi." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    imageUrl = publicUrl;
  }

  await prisma.product.update({
    where: { id },
    data: { name: parsed.data.name, price: parsed.data.price, imageUrl },
  });

  revalidatePath("/profile");
  return { success: "Produk berhasil diperbarui." };
}

export async function deleteProductAction(id: string) {
  const user = await requireVendor();
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.vendorId !== user.id)
    return { error: "Tidak ditemukan." };

  await prisma.product.delete({ where: { id } });
  revalidatePath("/profile");
  return { success: true };
}

export async function updatePortfolioAction(
  id: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const user = await requireVendor();

  const existing = await prisma.portfolio.findUnique({ where: { id } });
  if (!existing || existing.vendorId !== user.id) {
    return { error: "Portofolio tidak ditemukan." };
  }

  const raw = {
    bazaarName: String(formData.get("bazaarName") ?? ""),
    eventDate: String(formData.get("eventDate") ?? ""),
  };

  const parsed = portfolioSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key])
        fieldErrors[key] = issue.message;
    }
    return { error: "Periksa kembali data yang kamu isi.", fieldErrors };
  }

  let photoUrl = existing.photoUrl;
  const file = formData.get("photo");

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return { error: "Format foto harus PNG, JPG, atau WEBP." };
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return { error: "Ukuran foto maksimal 2MB." };
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/portfolio-${Date.now()}.${extension}`;

    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: "Gagal mengunggah foto. Coba lagi." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    photoUrl = publicUrl;
  }

  await prisma.portfolio.update({
    where: { id },
    data: {
      bazaarName: parsed.data.bazaarName,
      eventDate: new Date(parsed.data.eventDate),
      photoUrl,
    },
  });

  revalidatePath("/profile");
  return { success: "Portofolio berhasil diperbarui." };
}

export async function deletePortfolioAction(id: string) {
  const user = await requireVendor();
  const existing = await prisma.portfolio.findUnique({ where: { id } });
  if (!existing || existing.vendorId !== user.id)
    return { error: "Tidak ditemukan." };

  await prisma.portfolio.delete({ where: { id } });
  revalidatePath("/profile");
  return { success: true };
}
