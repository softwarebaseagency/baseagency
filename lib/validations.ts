import { z } from "zod";

export const customerImportSchema = z
  .object({
    full_name: z.string().min(2),
    phone: z.string().trim().optional().nullable(),
    whatsapp: z.string().trim().optional().nullable(),
    email: z.string().email().optional().nullable(),
    address: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    service_interest: z.string().optional().nullable(),
    status: z
      .enum(["NEW", "CONTACTED", "QUALIFIED", "CUSTOMER", "LOST"])
      .optional(),
    notes: z.string().optional().nullable()
  })
  .refine((data) => data.phone || data.email, {
    message: "Customer phone or email is required"
  });
