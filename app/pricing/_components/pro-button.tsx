"use client";

import { useCustomer } from "autumn-js/react";

export function ProButton() {
    const { attach, error } = useCustomer();

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <button
            className="block w-full transform rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 py-4 text-center font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={async () => await attach({ productId: "pro" })}
            type="button"
        >
            Get Altioran
        </button>
    );
}
