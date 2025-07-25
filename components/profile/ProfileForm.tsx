"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "@/trpc/client";
import { User, Mail, Calendar, Shield, Edit3, Save, X } from "lucide-react";

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
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border border-white/20">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white/60" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/10 rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-argesta font-bold text-white mb-1">
            {user.name}
          </h3>
          <p className="text-white/60 font-argesta tracking-wide">
            {user.email}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${user.emailVerified ? "bg-green-400" : "bg-red-400"}`} />
            <span className="text-sm text-white/60 font-argesta">
              {user.emailVerified ? "Email Verified" : "Email Not Verified"}
            </span>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <Edit3 className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white/60" />
            </div>
            <span className="text-sm font-argesta text-white/60 tracking-wide">EMAIL ADDRESS</span>
          </div>
          <p className="text-white font-argesta">{user.email}</p>
        </div>

        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white/60" />
            </div>
            <span className="text-sm font-argesta text-white/60 tracking-wide">MEMBER SINCE</span>
          </div>
          <p className="text-white font-argesta">{formatDate(user.createdAt)}</p>
        </div>

        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white/60" />
            </div>
            <span className="text-sm font-argesta text-white/60 tracking-wide">ACCOUNT STATUS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${user.emailVerified ? "bg-green-400" : "bg-red-400"}`} />
            <span className={`font-argesta ${user.emailVerified ? "text-green-400" : "text-red-400"}`}>
              {user.emailVerified ? "Active" : "Pending Verification"}
            </span>
          </div>
        </div>

        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white/60" />
            </div>
            <span className="text-sm font-argesta text-white/60 tracking-wide">DISPLAY NAME</span>
          </div>
          <p className="text-white font-argesta">{user.name}</p>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-argesta font-bold text-white">EDIT PROFILE</h4>
            <button
              onClick={() => {
                setIsEditing(false);
                setName(user.name);
              }}
              className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-argesta text-white/60 mb-3 tracking-wide">
                DISPLAY NAME
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 font-argesta"
                placeholder="Enter your display name"
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex-1 px-6 py-3 bg-white text-black font-argesta font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{updateProfile.isPending ? "SAVING..." : "SAVE CHANGES"}</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(user.name);
                }}
                className="px-6 py-3 bg-white/10 text-white font-argesta font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 