export const BUSINESS_CATEGORIES = [
  "F&B",
  "Fashion",
  "Lifestyle",
  "Beauty",
  "Services",
  "Other",
] as const;

export const TARGET_MARKETS = [
  { value: "pelajar", label: "Pelajar & Mahasiswa" },
  { value: "pekerja", label: "Pekerja Kantoran" },
  { value: "keluarga", label: "Keluarga & Anak-anak" },
  { value: "wisatawan", label: "Wisatawan" },
  { value: "umum", label: "Semua Kalangan" },
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const BUSINESS_CATEGORY_OTHER = "Other" satisfies BusinessCategory;
