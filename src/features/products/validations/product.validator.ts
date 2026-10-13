import { z } from "zod";

const IMAGE_URL_MAX = 200;

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  price: z
    .string()
    .trim()
    .min(1, "El precio es obligatorio.")
    .refine((value) => !Number.isNaN(Number(value)), "El precio debe ser un número.")
    .refine((value) => Number(value) >= 0, "El precio no puede ser negativo.")
    .refine(
      (value) => Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) < 1e-6,
      "El precio admite hasta 2 decimales.",
    )
    .transform((value) => Number(value)),
  imageUrl: z
    .string()
    .trim()
    .max(IMAGE_URL_MAX, "La URL de la imagen no puede superar los 200 caracteres.")
    .refine(
      (value) => value === "" || z.url().safeParse(value).success,
      "Ingresa una URL válida.",
    ),
  active: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
