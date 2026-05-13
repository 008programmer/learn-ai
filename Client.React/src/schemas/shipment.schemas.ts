import { z } from "zod";

export const ShipmentStatus = {
  Created: "Created",
  Processing: "Processing",
  Dispatched: "Dispatched",
  InTransit: "InTransit",
  Delivered: "Delivered",
  Received: "Received",
  Cancelled: "Cancelled",
} as const;

export type ShipmentStatus =
  (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().min(1, "ZIP code is required"),
});

export const shipmentItemSchema = z.object({
  product: z.string().min(1, "Product is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const createShipmentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  address: addressSchema,
  carrier: z.string().min(1, "Carrier is required"),
  receiverEmail: z.string().email("Invalid receiver email"),
  items: z
    .array(shipmentItemSchema)
    .min(1, "At least one item is required"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
export type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;

// API response types
export interface Address {
  street: string;
  city: string;
  zip: string;
}

export interface ShipmentItemResponse {
  product: string;
  quantity: number;
}

export interface ShipmentResponse {
  number: string;
  orderId: string;
  address: Address;
  carrier: string;
  receiverEmail: string;
  status: ShipmentStatus;
  items: ShipmentItemResponse[];
}
