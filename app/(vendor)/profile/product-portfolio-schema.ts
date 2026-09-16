import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  price: z.coerce.number().min(1, "Harga harus lebih dari 0"),
});

export type ProductInput = z.infer<typeof productSchema>;

export const portfolioSchema = z.object({
  bazaarName: z.string().min(3, "Nama bazaar minimal 3 karakter"),
  eventDate: z.string().min(1, "Tanggal wajib diisi"),
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;
