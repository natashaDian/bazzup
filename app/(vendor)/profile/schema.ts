import { z } from "zod";
import {
  BUSINESS_CATEGORIES,
  BUSINESS_CATEGORY_OTHER,
  type BusinessCategory,
} from "@/lib/constants";

export const vendorProfileSchema = z
  .object({
    businessName: z
      .string()
      .trim()
      .min(1, "Nama usaha wajib diisi.")
      .max(100, "Nama usaha maksimal 100 karakter."),
    businessType: z.enum(BUSINESS_CATEGORIES, {
      error: "Pilih kategori usaha.",
    }),
    businessTypeOther: z
      .string()
      .trim()
      .max(50, "Kategori maksimal 50 karakter.")
      .optional(),
    businessDesc: z
      .string()
      .trim()
      .max(1000, "Deskripsi maksimal 1000 karakter.")
      .optional()
      .or(z.literal("")),
    targetMarket: z
      .string()
      .trim()
      .max(500, "Target pasar maksimal 500 karakter.")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .max(20, "Nomor telepon maksimal 20 karakter.")
      .optional()
      .or(z.literal("")),
    instagram: z
      .string()
      .trim()
      .max(100, "Instagram maksimal 100 karakter.")
      .optional()
      .or(z.literal("")),
    whatsapp: z
      .string()
      .trim()
      .max(20, "WhatsApp maksimal 20 karakter.")
      .optional()
      .or(z.literal("")),
    tiktok: z
      .string()
      .trim()
      .max(100, "TikTok maksimal 100 karakter.")
      .optional()
      .or(z.literal("")),
    website: z
      .string()
      .trim()
      .max(200, "Website maksimal 200 karakter.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (
      data.businessType === BUSINESS_CATEGORY_OTHER &&
      !data.businessTypeOther?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Sebutkan kategori usahamu.",
        path: ["businessTypeOther"],
      });
    }
  });

export type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

export function resolveBusinessTypeDefaults(
  businessType: string | null
): { businessType: BusinessCategory | undefined; businessTypeOther: string } {
  if (!businessType) {
    return { businessType: undefined, businessTypeOther: "" };
  }

  const known = BUSINESS_CATEGORIES.find((category) => category === businessType);

  if (known && known !== BUSINESS_CATEGORY_OTHER) {
    return { businessType: known, businessTypeOther: "" };
  }

  return {
    businessType: BUSINESS_CATEGORY_OTHER,
    businessTypeOther: businessType,
  };
}
