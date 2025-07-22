"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface HabitsContextValue {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  editingHabit: string | null;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (habitId: string) => void;
  closeEditModal: () => void;
  
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  
  viewMode: "today" | "week" | "month";
  setViewMode: (mode: "today" | "week" | "month") => void;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}

interface HabitsProviderProps {
  children: ReactNode;
}

export function HabitsProvider({ children }: HabitsProviderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [selectedDate] = useState(() => new Date().toISOString().split('T')[0]!);
  const [viewMode, setViewMode] = useState<"today" | "week" | "month">("today");

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);
  const openEditModal = (habitId: string) => {
    setEditingHabit(habitId);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditingHabit(null);
    setIsEditModalOpen(false);
  };

  // Fonction pour changer la date (pour l'instant statique sur aujourd'hui)  
  const setSelectedDate = (date: string) => {
    // Pour l'instant on garde la date d'aujourd'hui
    // Cette fonction sera utile plus tard pour la navigation temporelle
    console.log("Date sélectionnée:", date);
  };

  const value: HabitsContextValue = {
    isCreateModalOpen,
    isEditModalOpen,
    editingHabit,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
} 