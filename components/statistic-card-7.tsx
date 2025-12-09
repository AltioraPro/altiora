import { ArrowUpRight, TrendingDown, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const cards = [
    {
        title: "Total Sales & Cost",
        subtitle: "Last 60 days",
        value: "$956.82k",
        valueColor: "text-green-600",
        badge: {
            color: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
            icon: ArrowUpRight,
            iconColor: "text-green-500",
            text: "+5.4%",
        },
        subtext: (
            <span className="font-medium text-green-600">
                +8.20k{" "}
                <span className="font-normal text-muted-foreground">
                    vs prev. 60 days
                </span>
            </span>
        ),
    },
    {
        title: "New Customers",
        subtitle: "This quarter",
        value: "1,245",
        valueColor: "text-blue-600",
        badge: {
            color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
            icon: UserPlus,
            iconColor: "text-blue-500",
            text: "+3.2%",
        },
        subtext: (
            <span className="font-medium text-blue-600">
                +39{" "}
                <span className="font-normal text-muted-foreground">
                    vs last quarter
                </span>
            </span>
        ),
    },
    {
        title: "Churn Rate",
        subtitle: "Last 30 days",
        value: "2.8%",
        valueColor: "text-red-500",
        badge: {
            color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
            icon: TrendingDown,
            iconColor: "text-red-500",
            text: "-1.1%",
        },
        subtext: (
            <span className="font-medium text-red-500">
                -0.3%{" "}
                <span className="font-normal text-muted-foreground">
                    vs prev. 30 days
                </span>
            </span>
        ),
    },
];

export default function StatisticCard7() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6 lg:p-12">
            <div className="@container w-full grow">
                <div className="grid @3xl:grid-cols-3 grid-cols-1 overflow-hidden rounded-xl border border-border bg-background">
                    {cards.map((card, i) => (
                        <Card
                            className="rounded-none border-0 border-border @3xl:border-x border-y @3xl:border-y-0 py-3 shadow-none first:border-0 last:border-0"
                            key={i}
                        >
                            <CardContent className="flex h-full flex-col justify-between space-y-6">
                                {/* Title & Subtitle */}
                                <div className="space-y-0.25">
                                    <div className="font-semibold text-foreground text-lg">
                                        {card.title}
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {card.subtitle}
                                    </div>
                                </div>

                                {/* Information */}
                                <div className="flex flex-1 grow flex-col justify-between gap-1.5">
                                    {/* Value & Delta */}
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-3xl tracking-tight">
                                            {card.value}
                                        </span>
                                        <Badge
                                            className={`${card.badge.color} flex items-center gap-1 rounded-full px-2 py-1 font-medium text-sm shadow-none`}
                                        >
                                            <card.badge.icon
                                                className={`h-3 w-3 ${card.badge.iconColor}`}
                                            />
                                            {card.badge.text}
                                        </Badge>
                                    </div>
                                    {/* Subtext */}
                                    <div className="text-sm">
                                        {card.subtext}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
