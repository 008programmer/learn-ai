import { create } from "zustand";
import type { CarrierResponse } from "@/schemas/carrier.schemas";
import { carriersApi } from "@/api/carriers";

interface CarriersState {
  carriers: CarrierResponse[];
  loading: boolean;
  error: string | null;
  fetchActive: () => Promise<void>;
  createCarrier: (name: string) => Promise<CarrierResponse>;
}

export const useCarriersStore = create<CarriersState>()((set) => ({
  carriers: [],
  loading: false,
  error: null,

  fetchActive: async () => {
    set({ loading: true, error: null });
    try {
      const carriers = await carriersApi.getActive();
      set({ loading: false, carriers });
    } catch {
      set({ loading: false, error: "Failed to fetch carriers" });
    }
  },

  createCarrier: async (name) => {
    set({ loading: true, error: null });
    try {
      const carrier = await carriersApi.create({ name });
      set((s) => ({ loading: false, carriers: [...s.carriers, carrier] }));
      return carrier;
    } catch {
      set({ loading: false, error: "Failed to create carrier" });
      throw new Error("Failed to create carrier");
    }
  },
}));
