import { z } from "zod";

export const createAreaSchema = z
  .object({
    name: z.string().min(2, "Area name must be at least 2 characters"),
    description: z.string().optional(),
    totalSlot: z.coerce.number().min(1, "Total slot must be at least 1"),
    pricePerSlot: z.coerce.number().min(1, "Price must be greater than 0"),
    categoryWanted: z
      .array(z.string())
      .min(1, "Select at least one category")
      .max(5, "You can select up to 5 categories"),
    categoryWantedOther: z.string().optional(),
    estimatedTraffic: z.coerce.number().min(0, "Estimated traffic is required"),
    visitorProfile: z.string().min(1, "Visitor profile is required"),
    peakHoursStart: z.string().min(1, "Start time is required"),
    peakHoursEnd: z.string().min(1, "End time is required"),
    hasElectricity: z.coerce.boolean().optional(),
  })
  .refine(
    (data) =>
      !data.categoryWanted.includes("Other") ||
      (data.categoryWantedOther?.trim().length ?? 0) > 0,
    {
      message: "Please specify the custom category",
      path: ["categoryWantedOther"],
    },
  );

export type CreateAreaInput = z.infer<typeof createAreaSchema>;
