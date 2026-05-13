import { z } from "zod";

export const createStockSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const increaseStockSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export type CreateStockFormValues = z.infer<typeof createStockSchema>;
export type IncreaseStockFormValues = z.infer<typeof increaseStockSchema>;

// API response types
export interface StockResponse {
  productName: string;
  quantity: number;
}
