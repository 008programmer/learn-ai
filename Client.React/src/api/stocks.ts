import { apiClient } from "./client";
import type { StockResponse } from "@/schemas/stock.schemas";

export const stocksApi = {
  getAll: () =>
    apiClient.get<StockResponse[]>("/api/stocks"),

  create: (body: { productName: string; quantity: number }) =>
    apiClient.post<StockResponse>("/api/stocks", body),

  getByProductName: (productName: string) =>
    apiClient.get<StockResponse>(`/api/stocks/${encodeURIComponent(productName)}`),

  increase: (body: { productName: string; quantity: number }) =>
    apiClient.post<void>("/api/stocks/increase", body),
};
