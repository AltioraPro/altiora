import { create } from "zustand";
import type { TradingJournal } from "@/server/db/schema";

interface EditJournalState {
    isOpen: boolean;
    journal: Pick<TradingJournal, "id" | "name" | "description"> | null;
    open: (
        journal: Pick<TradingJournal, "id" | "name" | "description">
    ) => void;
    close: () => void;
}

export const useEditJournalStore = create<EditJournalState>((set) => ({
    isOpen: false,
    journal: null,
    open: (journal) =>
        set({
            isOpen: true,
            journal,
        }),
    close: () => set({ isOpen: false, journal: null }),
}));
