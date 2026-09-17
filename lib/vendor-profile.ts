import type { User } from "@prisma/client";

const REQUIRED_PROFILE_FIELDS = [
  "businessName",
  "businessType",
  "businessDesc",
  "targetMarket",
  "phone",
  "whatsapp",
  "profileImageUrl",
] as const satisfies readonly (keyof User)[];

export function isVendorProfileComplete(user: User): boolean {
  return REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = user[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}
