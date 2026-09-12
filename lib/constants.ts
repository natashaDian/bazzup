export const BUSINESS_CATEGORIES = [
  "F&B",
  "Fashion",
  "Lifestyle",
  "Beauty",
  "Services",
  "Other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const BUSINESS_CATEGORY_OTHER = "Other" satisfies BusinessCategory;
