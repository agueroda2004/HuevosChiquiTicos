import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ingresa un correo válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const verificationSchema = z.object({
  code: z
    .string()
    .length(6, "Ingresa el código de 6 dígitos.")
    .regex(/^\d+$/, "El código solo debe contener números."),
});

export type VerificationFormValues = z.infer<typeof verificationSchema>;
