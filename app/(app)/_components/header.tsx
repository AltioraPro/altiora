import { DropdownUser } from "@/components/dropdown-user";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";
import { OpenSearchButton } from "./search/open-search-button";

export const Header = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <header
        className={cn(
            "flex h-[70px] border-white/10 border-b bg-transparent",
            className
        )}
        {...props}
    >
        <div className="mx-auto flex h-full w-full items-center justify-end px-6">
            <MobileMenu />
            <OpenSearchButton />

            <div className="z-10 ml-auto flex flex-1 items-center justify-end space-x-3">
                <DropdownUser />
            </div>
        </div>
    </header>
);
