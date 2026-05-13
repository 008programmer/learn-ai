import { create } from "zustand";
import type { ShipmentResponse } from "@/schemas/shipment.schemas";
import { shipmentsApi } from "@/api/shipments";
import type { CreateShipmentRequest } from "@/api/shipments";

interface ShipmentsState {
  shipments: ShipmentResponse[];
  selected: ShipmentResponse | null;
  loading: boolean;
  error: string | null;
  fetchByNumber: (number: string) => Promise<void>;
  createShipment: (req: CreateShipmentRequest) => Promise<ShipmentResponse>;
  performAction: (action: string, number: string) => Promise<void>;
  setSelected: (shipment: ShipmentResponse | null) => void;
}

export const useShipmentsStore = create<ShipmentsState>()((set) => ({
  shipments: [],
  selected: null,
  loading: false,
  error: null,

  fetchByNumber: async (number) => {
    set({ loading: true, error: null });
    try {
      const shipment = await shipmentsApi.getByNumber(number);
      set((s) => ({
        loading: false,
        selected: shipment,
        shipments: s.shipments.some((sh) => sh.number === number)
          ? s.shipments.map((sh) => (sh.number === number ? shipment : sh))
          : [...s.shipments, shipment],
      }));
    } catch {
      set({ loading: false, error: "Failed to fetch shipment" });
    }
  },

  createShipment: async (req) => {
    set({ loading: true, error: null });
    try {
      const shipment = await shipmentsApi.create(req);
      set((s) => ({
        loading: false,
        shipments: [...s.shipments, shipment],
        selected: shipment,
      }));
      return shipment;
    } catch {
      set({ loading: false, error: "Failed to create shipment" });
      throw new Error("Failed to create shipment");
    }
  },

  performAction: async (action, number) => {
    set({ loading: true, error: null });
    try {
      const actionFns: Record<string, (n: string) => Promise<void>> = {
        cancel: shipmentsApi.cancel,
        deliver: shipmentsApi.deliver,
        dispatch: shipmentsApi.dispatch,
        process: shipmentsApi.process,
        receive: shipmentsApi.receive,
        transit: shipmentsApi.transit,
      };
      const fn = actionFns[action];
      if (fn) await fn(number);
      // Refresh shipment state
      const shipment = await shipmentsApi.getByNumber(number);
      set((s) => ({
        loading: false,
        selected: shipment,
        shipments: s.shipments.map((sh) =>
          sh.number === number ? shipment : sh
        ),
      }));
    } catch {
      set({ loading: false, error: `Failed to ${action} shipment` });
    }
  },

  setSelected: (shipment) => set({ selected: shipment }),
}));
