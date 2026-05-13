import { z } from "zod";

export const createCarrierSchema = z.object({
  name: z.string().min(1, "Carrier name is required"),
});

export type CreateCarrierFormValues = z.infer<typeof createCarrierSchema>;

// API response types
export interface CarrierResponse {
  id: string;
  name: string;
  isActive: boolean;
}
