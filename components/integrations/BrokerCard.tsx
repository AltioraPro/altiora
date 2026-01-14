"use client";

import { RiArrowRightLine, RiCheckLine, RiLockLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
                    <Badge className="gap-1" variant="secondary">
                        <RiLockLine className="h-3 w-3" />
                        Premium
                    </Badge>
                </div>
            )}

            <CardHeader>
                <div className="flex items-center gap-4">
                    {logo && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <img
                                alt={name}
                                className="h-8 w-8 object-contain"
                                src={logo}
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <ul className="space-y-2 text-muted-foreground text-sm">
                    {features.map((feature, index) => (
                        <li className="flex items-center gap-2" key={index}>
                            <RiCheckLine className="h-4 w-4 text-green-500" />
                            {feature}
                        </li>
                    ))}
                </ul>

                <Button
                    className="w-full"
                    disabled={isConnected}
                    onClick={onConnect}
                    variant={isConnected ? "outline" : "primary"}
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
