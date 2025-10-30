"use client";

import {
    Award,
    BarChart3,
    CheckCircle,
    Clock,
    Crown,
    MessageCircle,
    User,
    Users,
    X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface DiscordWelcomePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: () => void;
    skipLocalStorage?: boolean;
}

export function DiscordWelcomePopup({
    isOpen,
    onClose,
    onConnect,
    skipLocalStorage = false,
}: DiscordWelcomePopupProps) {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const features = [
        {
            icon: Users,
            title: "Exclusive community",
            description:
                "Join a community of passionate traders and developers",
        },
        {
            icon: Crown,
            title: "Ranking system",
            description:
                "Progress through 9 different ranks based on your performance",
        },
        {
            icon: Clock,
            title: "Pomodoro tracking",
            description: "Automatically sync your work sessions",
        },
        {
            icon: BarChart3,
            title: "Advanced analytics",
            description: "Access detailed statistics on your progress",
        },
        {
            icon: Award,
            title: "Exclusive roles",
            description: "Unlock special roles based on your level",
        },
    ];

    const handleConnect = () => {
        onConnect();
        onClose();
    };

    const handleSkip = () => {
        if (!skipLocalStorage) {
            localStorage.setItem("discord-welcome-seen", "true");
        }
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <Card
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/20 bg-pure-black text-pure-white"
                onClick={(e) => e.stopPropagation()}
            >
                <CardHeader className="relative">
                    <button
                        className="absolute top-4 right-4 rounded-lg p-2 transition-colors hover:bg-white/10"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                            {imageError ? (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                                    <User className="h-8 w-8 text-white/60" />
                                </div>
                            ) : (
                                <Image
                                    alt="Altiora Logo"
                                    className="object-contain"
                                    height={64}
                                    onError={() => setImageError(true)}
                                    src="/img/logo.png"
                                    width={64}
                                />
                            )}
                        </div>
                        <CardTitle className="mb-2 font-bold text-2xl">
                            Welcome to the Altiora community!
                        </CardTitle>
                        <CardDescription className="text-lg text-white/60">
                            Connect your Discord to unlock all features
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Features Grid */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    className="flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-3"
                                    key={index}
                                >
                                    <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/60" />
                                    <div>
                                        <h3 className="mb-1 font-medium text-sm text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-white/60 text-xs">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Benefits List */}
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <h3 className="mb-2 flex items-center font-semibold text-sm text-white">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                            Benefits of Discord connection
                        </h3>
                        <ul className="space-y-1 text-white/80 text-xs">
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Automatic rank synchronization</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>
                                    Access to private channels based on your
                                    level
                                </span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Pomodoro session notifications</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>Participation in community events</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <div className="h-1 w-1 rounded-full bg-white/40" />
                                <span>
                                    Priority support and personalized advice
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            className="flex-1 bg-[#5865F2] py-2 text-white hover:bg-[#4752C4]"
                            onClick={handleConnect}
                        >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Connect Discord now
                        </Button>
                        <Button
                            className="flex-1 border-white/20 bg-pure-black py-2"
                            onClick={handleSkip}
                            variant="outline"
                        >
                            Later
                        </Button>
                    </div>

                    <p className="text-center text-white/40 text-xs">
                        You can always connect your Discord from your profile
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
