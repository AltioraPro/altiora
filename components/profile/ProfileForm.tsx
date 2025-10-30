"use client";

import { Calendar, Edit3, Mail, Save, Shield, User, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api } from "@/trpc/client";

export function ProfileForm() {
    const {
        data: user,
        isLoading,
        error,
    } = api.auth.getCurrentUser.useQuery(undefined, {
        retry: (failureCount, error) => {
            if (
                error &&
                typeof error === "object" &&
                "data" in error &&
                error.data &&
                typeof error.data === "object" &&
                "code" in error.data &&
                error.data.code === "UNAUTHORIZED"
            ) {
                return false;
            }
            return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const [name, setName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    if (user && name === "") {
        setName(user.name);
    }

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

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);

    if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "code" in error.data &&
        error.data.code === "UNAUTHORIZED"
    ) {
        return (
            <div className="py-8 text-center">
                <div className="mb-4 text-white/60">
                    Session expired. Please log in again.
                </div>
                <a className="text-white underline" href="/auth/login">
                    Log in
                </a>
            </div>
        );
    }

    if (isLoading || !user) {
        return (
            <div className="space-y-8">
                <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 animate-pulse rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                        <div className="h-6 animate-pulse rounded bg-white/10" />
                        <div className="h-4 animate-pulse rounded bg-white/10" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[...new Array(4)].map((_, i) => (
                        <div
                            className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-6"
                            key={i}
                        >
                            <div className="mb-4 h-4 rounded bg-white/10" />
                            <div className="h-6 rounded bg-white/10" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const renderAvatar = () => {
        if (user.discordProfile?.discordAvatar) {
            return (
                <Image
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover"
                    height={80}
                    src={`https://cdn.discordapp.com/avatars/${user.discordProfile.discordId}/${user.discordProfile.discordAvatar}.png`}
                    width={80}
                />
            );
        }
        if (user.image) {
            return (
                <Image
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover"
                    height={80}
                    src={user.image}
                    width={80}
                />
            );
        }
        return <User className="h-8 w-8 text-white/60" />;
    };

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-white/5">
                        {renderAvatar()}
                    </div>
                    {user.discordProfile?.discordConnected && (
                        <div className="-bottom-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#5865F2]">
                            <div className="h-3 w-3 rounded-full bg-white" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="mb-1 font-bold text-2xl text-white">
                        {user.name}
                    </h3>
                    <p className="text-white/60 tracking-wide">{user.email}</p>
                    <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div
                                className={`h-2 w-2 rounded-full ${user.emailVerified ? "bg-green-400" : "bg-red-400"}`}
                            />
                            <span className="text-sm text-white/60">
                                {user.emailVerified
                                    ? "Email Verified"
                                    : "Email Not Verified"}
                            </span>
                        </div>
                        {user.discordProfile?.discordConnected && (
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-[#5865F2]" />
                                <span className="text-[#5865F2] text-sm">
                                    Discord Connected
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {!isEditing && (
                    <button
                        className="group rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                        onClick={() => setIsEditing(true)}
                        type="button"
                    >
                        <Edit3 className="h-5 w-5 text-white/60 transition-colors group-hover:text-white" />
                    </button>
                )}
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <Mail className="h-4 w-4 text-white/60" />
                        </div>
                        <span className="text-sm text-white/60 tracking-wide">
                            EMAIL ADDRESS
                        </span>
                    </div>
                    <p className="text-white">{user.email}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <Calendar className="h-4 w-4 text-white/60" />
                        </div>
                        <span className="text-sm text-white/60 tracking-wide">
                            MEMBER SINCE
                        </span>
                    </div>
                    <p className="text-white">{formatDate(user.createdAt)}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <Shield className="h-4 w-4 text-white/60" />
                        </div>
                        <span className="text-sm text-white/60 tracking-wide">
                            ACCOUNT STATUS
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`h-2 w-2 rounded-full ${user.emailVerified ? "bg-green-400" : "bg-red-400"}`}
                        />
                        <span
                            className={`${user.emailVerified ? "text-green-400" : "text-red-400"}`}
                        >
                            {user.emailVerified
                                ? "Active"
                                : "Pending Verification"}
                        </span>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                            <User className="h-4 w-4 text-white/60" />
                        </div>
                        <span className="text-sm text-white/60 tracking-wide">
                            DISPLAY NAME
                        </span>
                    </div>
                    <p className="text-white">{user.name}</p>
                </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
                <div className="rounded-xl border border-white/20 bg-white/10 p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h4 className="font-bold text-lg text-white">
                            EDIT PROFILE
                        </h4>
                        <button
                            className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10"
                            onClick={() => {
                                setIsEditing(false);
                                setName(user.name);
                            }}
                            type="button"
                        >
                            <X className="h-4 w-4 text-white/60" />
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                className="mb-3 block text-sm text-white/60 tracking-wide"
                                htmlFor="name"
                            >
                                DISPLAY NAME
                            </label>
                            <input
                                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all duration-300 focus:border-white/40 focus:bg-white/10 focus:outline-none"
                                id="name"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your display name"
                                required
                                type="text"
                                value={name}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-white px-6 py-3 font-bold text-black transition-all duration-300 hover:bg-white/90 disabled:opacity-50"
                                disabled={updateProfile.isPending}
                                type="submit"
                            >
                                <Save className="h-4 w-4" />
                                <span>
                                    {updateProfile.isPending
                                        ? "SAVING..."
                                        : "SAVE CHANGES"}
                                </span>
                            </button>

                            <button
                                className="rounded-xl bg-white/10 px-6 py-3 font-bold text-white transition-all duration-300 hover:bg-white/20"
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(user.name);
                                }}
                                type="button"
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
