import { create } from 'zustand'

interface AppState {
    currentStation: number
    setStation: (index: number) => void
}

export const useStore = create<AppState>((set) => ({
    currentStation: 0,
    setStation: (index) => set({ currentStation: index }),
}))
