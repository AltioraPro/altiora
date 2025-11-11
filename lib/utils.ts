import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export function getNameFromEmail(email: string): string {
    const emailLocalPart = email.split("@")[0];
    const firstName = emailLocalPart.split(".")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}
