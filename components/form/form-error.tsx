import {
    type RemixiconComponentType,
    RiErrorWarningLine,
} from "@remixicon/react";

interface FormErrorProps extends React.ComponentProps<"div"> {
    error: string;
    icon?: RemixiconComponentType;
}

export function FormError({
    error,
    icon: Icon = RiErrorWarningLine,
}: FormErrorProps) {
    return (
        <div className="flex gap-2 bg-red-500/10 px-4 py-2 text-sm">
            <Icon className="mt-0.5 text-red-500" size={16} />
            <p>{error}</p>
        </div>
    );
}
