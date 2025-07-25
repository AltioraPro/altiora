"use client";

import { useState } from "react";
import { api } from "@/trpc/client";

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);

  const updateProfile = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      alert("Profil mis à jour avec succès");
      setIsEditing(false);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium">{user.name}</h3>
          <p className="text-white/60">{user.email}</p>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Email</span>
          <span className="font-medium">{user.email}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Email vérifié</span>
          <span className={`font-medium ${user.emailVerified ? "text-green-400" : "text-red-400"}`}>
            {user.emailVerified ? "Oui" : "Non"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60">Membre depuis</span>
          <span className="font-medium">{formatDate(user.createdAt)}</span>
        </div>
      </div>

      {/* Formulaire de modification */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nom
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:border-white/30"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={updateProfile.isLoading}
              className="px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-white/90 disabled:opacity-50"
            >
              {updateProfile.isLoading ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setName(user.name);
              }}
              className="px-4 py-2 bg-white/10 text-white font-medium rounded-md hover:bg-white/20"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-white/10 text-white font-medium rounded-md hover:bg-white/20"
        >
          Modifier le profil
        </button>
      )}
    </div>
  );
} 