import { apiClient } from "./client";
import type { CarrierResponse } from "@/schemas/carrier.schemas";

export const carriersApi = {
  create: (body: { name: string }) =>
    apiClient.post<CarrierResponse>("/api/carriers", body),

  getActive: () => apiClient.get<CarrierResponse[]>("/api/carriers/active"),
};
