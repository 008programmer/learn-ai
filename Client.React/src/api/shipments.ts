import { apiClient } from "./client";
import type { ShipmentResponse } from "@/schemas/shipment.schemas";

export interface CreateShipmentRequest {
  orderId: string;
  address: { street: string; city: string; zip: string };
  carrier: string;
  receiverEmail: string;
  items: { product: string; quantity: number }[];
}

export const shipmentsApi = {
  create: (body: CreateShipmentRequest) =>
    apiClient.post<ShipmentResponse>("/api/shipments", body),

  getByNumber: (shipmentNumber: string) =>
    apiClient.get<ShipmentResponse>(`/api/shipments/${shipmentNumber}`),

  cancel: (shipmentNumber: string) =>
    apiClient.post<void>(`/api/shipments/cancel/${shipmentNumber}`),

  deliver: (shipmentNumber: string) =>
    apiClient.post<void>(`/api/shipments/deliver/${shipmentNumber}`),

  dispatch: (shipmentNumber: string) =>
    apiClient.post<void>(`/api/shipments/dispatch/${shipmentNumber}`),

  process: (shipmentNumber: string) =>
    apiClient.post<void>(`/api/shipments/process/${shipmentNumber}`),

  receive: (shipmentNumber: string) =>
    apiClient.post<void>(`/api/shipments/receive/${shipmentNumber}`),

  transit: (shipmentNumber: string) =>
    apiClient.post<void>(`/api/shipments/transit/${shipmentNumber}`),
};
