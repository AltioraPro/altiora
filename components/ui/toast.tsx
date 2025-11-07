"use client";

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";

interface Toast {
    id: string;
    type: "success" | "error" | "info";
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        (toast: Omit<Toast, "id">) => {
            const id = Math.random().toString(36).substr(2, 9);
            const newToast = { ...toast, id };

            setToasts((prev) => [...prev, newToast]);

            const duration = toast.duration ?? 5000;
            setTimeout(() => {
                removeToast(id);
            }, duration);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-99999 space-y-2">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    onRemove={removeToast}
                    toast={toast}
                />
            ))}
        </div>
    );
}

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const getIcon = () => {
        switch (toast.type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-400" />;
            case "info":
                return <Info className="h-5 w-5 text-blue-400" />;
        }
    };

    const getBgColor = () => {
        switch (toast.type) {
            case "success":
                return "bg-green-500/10 border-green-500/20";
            case "error":
                return "bg-red-500/10 border-red-500/20";
            case "info":
                return "bg-blue-500/10 border-blue-500/20";
        }
    };

    return (
        <div
            className={`slide-in-from-right-full flex animate-in items-start space-x-3 rounded-xl border p-4 backdrop-blur-md duration-300 ${getBgColor()}
    `}
        >
            {getIcon()}
            <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm text-white">
                    {toast.title}
                </h4>
                {toast.message && (
                    <p className="mt-1 text-sm text-white/60">
                        {toast.message}
                    </p>
                )}
            </div>
            <button
                className="text-white/40 transition-colors hover:text-white/60"
                onClick={() => onRemove(toast.id)}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
