import { z } from "zod";

export const createBazaarSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
    eventStartDate: z.string().min(1, "Start date is required"),
    eventEndDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => new Date(data.eventEndDate) >= new Date(data.eventStartDate),
    {
      message: "End date must be on or after the start date",
      path: ["eventEndDate"],
    },
  );

export type CreateBazaarInput = z.infer<typeof createBazaarSchema>;
