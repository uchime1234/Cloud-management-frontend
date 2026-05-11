import { create } from "zustand"
import type { AppState } from "../types"

export const useAppStore = create<AppState>((set) => ({
  selectedFeature: null,
  selectedProvider: null,
  theme: "light",
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "dark" ? "light" : "dark",
    })),
}))
