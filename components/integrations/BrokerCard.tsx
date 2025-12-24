"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiCheckLine, RiLockLine, RiArrowRightLine } from "@remixicon/react";

interface BrokerCardProps {
    name: string;
    description: string;
    logo?: string;
    features: string[];
    isConnected?: boolean;
    isPremium?: boolean;
    onConnect: () => void;
}

export function BrokerCard({
    name,
    description,
    logo,
    features,
    isConnected = false,
    isPremium = false,
    onConnect,
}: BrokerCardProps) {
    return (
        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
            {isPremium && (
                <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="gap-1">
                        <RiLockLine className="h-3 w-3" />
                        Premium
                    </Badge>
                </div>
            )}

            <CardHeader>
                <div className="flex items-center gap-4">
                    {logo && (
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <img src={logo} alt={name} className="h-8 w-8 object-contain" />
                        </div>
                    )}
                    <div className="flex-1">
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <RiCheckLine className="h-4 w-4 text-green-500" />
                            {feature}
                        </li>
                    ))}
                </ul>

                <Button
                    onClick={onConnect}
                    disabled={isConnected}
                    className="w-full"
                    variant={isConnected ? "outline" : "default"}
                >
                    {isConnected ? (
                        <>
                            <RiCheckLine className="mr-2 h-4 w-4" />
                            Connected
                        </>
                    ) : (
                        <>
                            Connect {name}
                            <RiArrowRightLine className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
