import { create } from "zustand";

interface CreateJournalState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useCreateJournalStore = create<CreateJournalState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));
