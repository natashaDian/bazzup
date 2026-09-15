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

// A vendor must fill in all of these before organizers can review them, so
// the app blocks entry to bazaar detail pages until every field is set.
export function isVendorProfileComplete(user: User): boolean {
  return REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = user[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}
