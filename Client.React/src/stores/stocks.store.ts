import { create } from "zustand";
import type { StockResponse } from "@/schemas/stock.schemas";
import { stocksApi } from "@/api/stocks";

interface StocksState {
  stocks: StockResponse[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchByProduct: (productName: string) => Promise<void>;
  createStock: (productName: string, quantity: number) => Promise<StockResponse>;
  increaseStock: (productName: string, quantity: number) => Promise<void>;
}

export const useStocksStore = create<StocksState>()((set) => ({
  stocks: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const stocks = await stocksApi.getAll();
      set({ loading: false, stocks });
    } catch {
      set({ loading: false, error: "Failed to fetch stocks" });
    }
  },

  fetchByProduct: async (productName) => {
    set({ loading: true, error: null });
    try {
      const stock = await stocksApi.getByProductName(productName);
      set((s) => ({
        loading: false,
        stocks: s.stocks.some((st) => st.productName === productName)
          ? s.stocks.map((st) => (st.productName === productName ? stock : st))
          : [...s.stocks, stock],
      }));
    } catch {
      set({ loading: false, error: "Failed to fetch stock" });
    }
  },

  createStock: async (productName, quantity) => {
    set({ loading: true, error: null });
    try {
      const stock = await stocksApi.create({ productName, quantity });
      set((s) => ({ loading: false, stocks: [...s.stocks, stock] }));
      return stock;
    } catch {
      set({ loading: false, error: "Failed to create stock" });
      throw new Error("Failed to create stock");
    }
  },

  increaseStock: async (productName, quantity) => {
    set({ loading: true, error: null });
    try {
      await stocksApi.increase({ productName, quantity });
      set((s) => ({
        loading: false,
        stocks: s.stocks.map((st) =>
          st.productName === productName
            ? { ...st, quantity: st.quantity + quantity }
            : st
        ),
      }));
    } catch {
      set({ loading: false, error: "Failed to increase stock" });
    }
  },
}));
