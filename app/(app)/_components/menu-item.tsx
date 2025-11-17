import { RiArrowDownSLine } from "@remixicon/react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/constants/roles";
import { cn } from "@/lib/utils";
import { MENU_ITEMS } from "./main-menu";

interface ItemProps {
    item: {
        path: Route;
        name: string;
        children?: { path: Route; name: string }[];
        requiredRole?: UserRole;
    };
    isActive: boolean;
    isExpanded: boolean;
    isItemExpanded: boolean;
    onToggle: (path: Route) => void;
    onSelect?: () => void;
}

export const Item = ({
    item,
    isActive,
    isExpanded,
    isItemExpanded,
    onToggle,
    onSelect,
}: ItemProps) => {
    const Icon = MENU_ITEMS[item.path as keyof typeof MENU_ITEMS];
    const pathname = usePathname();
    const hasChildren = item.children && item.children.length > 0;

    // Children should be visible when: expanded sidebar AND this item is expanded
    const shouldShowChildren = isExpanded && isItemExpanded;

    const handleChevronClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(item.path);
    };

    return (
        <div className="group">
            <Link
                className="group"
                href={item.path}
                onClick={() => onSelect?.()}
                prefetch
            >
                <div className="relative">
                    {/* Background that expands */}
                    <div
                        className={cn(
                            "mr-[15px] ml-[15px] h-[40px] border border-transparent transition-all duration-200 ease-&lsqb;cubic-bezier(0.4,0,0.2,1)&rsqb;",
                            isActive && "border-neutral-700 bg-neutral-900",
                            isExpanded ? "w-[calc(100%-30px)]" : "w-[40px]"
                        )}
                    />

                    {/* Icon - always in same position from sidebar edge */}
                    <div className="pointer-events-none absolute top-0 left-[15px] flex h-[40px] w-[40px] items-center justify-center text-black group-hover:text-primary! dark:text-[#666666]">
                        <div className={cn(isActive && "dark:text-white!")}>
                            <Icon />
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="pointer-events-none absolute top-0 right-[4px] left-[55px] flex h-[40px] items-center">
                            <span
                                className={cn(
                                    "font-medium text-[#666] text-sm transition-opacity duration-200 ease-in-out group-hover:text-primary",
                                    "overflow-hidden whitespace-nowrap",
                                    hasChildren ? "pr-2" : "",
                                    isActive && "text-primary"
                                )}
                            >
                                {item.name}
                            </span>
                            {hasChildren && (
                                <button
                                    className={cn(
                                        "mr-3 ml-auto flex h-8 w-8 items-center justify-center transition-all duration-200",
                                        "pointer-events-auto text-[#888] hover:text-primary",
                                        isActive && "text-primary/60",
                                        shouldShowChildren && "rotate-180"
                                    )}
                                    onClick={handleChevronClick}
                                    type="button"
                                >
                                    <RiArrowDownSLine size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </Link>

            {/* Children */}
            {hasChildren && (
                <div
                    className={cn(
                        "overflow-hidden transition-all duration-300 ease-out",
                        shouldShowChildren ? "mt-1 max-h-96" : "max-h-0"
                    )}
                >
                    {item.children?.map((child, index) => {
                        const isChildActive = pathname === child.path;
                        return (
                            <ChildItem
                                child={child}
                                index={index}
                                isActive={isChildActive}
                                isExpanded={isExpanded}
                                key={child.path}
                                onSelect={onSelect}
                                shouldShow={shouldShowChildren}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const ChildItem = ({
    child,
    isActive,
    isExpanded,
    shouldShow,
    onSelect,
    index,
}: {
    child: { path: Route; name: string };
    isActive: boolean;
    isExpanded: boolean;
    shouldShow: boolean;
    onSelect?: () => void;
    index: number;
}) => {
    const showChild = isExpanded && shouldShow;

    return (
        <Link
            className="group/child block"
            href={child.path}
            onClick={() => onSelect?.()}
            prefetch
        >
            <div className="relative">
                {/* Child item text */}
                <div
                    className={cn(
                        "mr-[15px] ml-[35px] flex h-[32px] items-center",
                        "border-[#DCDAD2] border-l pl-3 dark:border-[#2C2C2C]",
                        "transition-all duration-200 ease-out",
                        showChild
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-2 opacity-0"
                    )}
                    style={{
                        transitionDelay: showChild
                            ? `;${40 + index * 20}ms`
                            : `${index * 20}ms`,
                    }}
                >
                    <span
                        className={cn(
                            "font-medium text-xs transition-colors duration-200",
                            "text-[#888] group-hover/child:text-primary",
                            "overflow-hidden whitespace-nowrap",
                            isActive && "text-primary"
                        )}
                    >
                        {child.name}
                    </span>
                </div>
            </div>
        </Link>
    );
};
