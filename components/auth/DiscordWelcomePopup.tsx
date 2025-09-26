"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
MessageCircle, 
X, 
Crown, 
Users,
Clock,
BarChart3,
Award,
CheckCircle,
User
} from "lucide-react";


interface DiscordWelcomePopupProps {
isOpen: boolean;
onClose: () => void;
onConnect: () => void;
skipLocalStorage?: boolean; 
}

export function DiscordWelcomePopup({ isOpen, onClose, onConnect, skipLocalStorage = false }: DiscordWelcomePopupProps) {
const [imageError, setImageError] = useState(false);

useEffect(() => {
    if (isOpen) {
    document.body.style.overflow = 'hidden';
    } else {
    document.body.style.overflow = 'unset';
    }

    return () => {
    document.body.style.overflow = 'unset';
    };
}, [isOpen]);

if (!isOpen) return null;

const features = [
    {
    icon: Users,
    title: "Exclusive community",
    description: "Join a community of passionate traders and developers"
    },
    {
    icon: Crown,
    title: "Ranking system",
    description: "Progress through 9 different ranks based on your performance"
    },
    {
    icon: Clock,
    title: "Pomodoro tracking",
    description: "Automatically sync your work sessions"
    },
    {
    icon: BarChart3,
    title: "Advanced analytics",
    description: "Access detailed statistics on your progress"
    },
    {
    icon: Award,
    title: "Exclusive roles",
    description: "Unlock special roles based on your level"
    }
];


const handleConnect = () => {
    onConnect();
    onClose();
};

const handleSkip = () => {
    if (!skipLocalStorage) {
    localStorage.setItem('discord-welcome-seen', 'true');
    }
    onClose();
};

return (
    <div 
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
    >
    <Card 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-pure-black border border-white/20 text-pure-white"
        onClick={(e) => e.stopPropagation()}
    >
        <CardHeader className="relative">
        <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
            <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            {!imageError ? (
                <Image
                src="/img/logo.png" 
                alt="Altiora Logo" 
                width={64}
                height={64}
                className="object-contain"
                onError={() => setImageError(true)}
                />
            ) : (
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white/60" />
                </div>
            )}
            </div>
            <CardTitle className="text-2xl font-bold mb-2">
            Welcome to the Altiora community!
            </CardTitle>
            <CardDescription className="text-white/60 text-lg">
            Connect your Discord to unlock all features
            </CardDescription>
        </div>
        </CardHeader>

        <CardContent className="space-y-4">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Icon className="w-5 h-5 text-white/60 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-medium text-white mb-1 text-sm">{feature.title}</h3>
                    <p className="text-xs text-white/60">{feature.description}</p>
                </div>
                </div>
            );
            })}
        </div>

        {/* Benefits List */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <h3 className="font-semibold text-white mb-2 flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            Benefits of Discord connection
            </h3>
            <ul className="space-y-1 text-xs text-white/80">
            <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <span>Automatic rank synchronization</span>
            </li>
            <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <span>Access to private channels based on your level</span>
            </li>
            <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <span>Pomodoro session notifications</span>
            </li>
            <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <span>Participation in community events</span>
            </li>
            <li className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-white/40 rounded-full" />
                <span>Priority support and personalized advice</span>
            </li>
            </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
            <Button
            onClick={handleConnect}
            className="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white py-2"
            >
            <MessageCircle className="w-4 h-4 mr-2" />
            Connect Discord now
            </Button>
            <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 border-white/20 py-2 bg-pure-black"
            >
            Later
            </Button>
        </div>

        <p className="text-center text-xs text-white/40">
            You can always connect your Discord from your profile
        </p>
        </CardContent>
    </Card>
    </div>
);
}
