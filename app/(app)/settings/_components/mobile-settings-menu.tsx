import { RiArrowRightLine } from "@remixicon/react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { settingsSearchParams } from "../search-params";
import { navigationItems } from "./settings-sidebar";

export function MobileSettingsMenu() {
    const [page, setPage] = useQueryState("page", settingsSearchParams.page);

    return (
        <aside className={cn("w-full shrink-0", !page && "block md:hidden")}>
            <h2 className="mb-4 font-medium text-neutral-50 text-xl">
                Settings
            </h2>
            <nav>
                <div className="flex flex-col gap-4">
                    {navigationItems.map((item) => (
                        <div className="flex flex-col gap-2" key={item.label}>
                            <span className="font-medium text-muted-foreground text-xs">
                                {item.label}
                            </span>

                            <div className="flex flex-col gap-2">
                                {item.items.map((item) => (
                                    <Button
                                        className="h-14 font-normal text-sm"
                                        key={item.href}
                                        onClick={() => setPage(item.href)}
                                        variant="outline"
                                    >
                                        <item.icon className="size-4 text-neutral-400" />

                                        {item.label}

                                        <RiArrowRightLine className="ml-auto size-4 text-neutral-400" />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>
        </aside>
    );
}
