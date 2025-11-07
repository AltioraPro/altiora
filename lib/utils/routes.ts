import type { Route } from "next";

export type RouteHrefProps = {
    href: Route;
};

export type WithRouteHref<TProps = Record<string, unknown>> = TProps & {
    href: Route;
};

export const route = <T extends `/${string}`>(path: T): Route => path as Route;

export const routeFn = <A extends unknown[], T extends `/${string}`>(
    fn: (...args: A) => T
) => ((...args: A) => route(fn(...args))) as (...args: A) => Route;

export const withQuery = (
    base: Route,
    params: Record<string, string | number | boolean | undefined | null>
): Route => {
    const usp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            continue;
        }
        usp.set(key, String(value));
    }
    const qs = usp.toString();
    return (qs ? `${base}?${qs}` : base) as Route;
};

export type NavItem = {
    href: Route;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    current?: boolean;
    disabled?: boolean;
};
