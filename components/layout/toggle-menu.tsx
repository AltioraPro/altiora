"use client";

interface ToggleMenuProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isMenuOpen: boolean;
    toggleMenu: () => void;
}

export function ToggleMenu({
    isMenuOpen,
    toggleMenu,
    ...props
}: ToggleMenuProps) {
    return (
        <button
            aria-label="Toggle menu"
            className="group relative flex size-12 items-center justify-center"
            onClick={toggleMenu}
            {...props}
        >
            <div className="relative h-6 w-6 cursor-pointer">
                <div
                    className={
                        "absolute inset-0 transition-all duration-700 ease-out"
                    }
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className={`block h-0.5 bg-white transition-all duration-500 ease-out ${
                            isMenuOpen
                                ? "w-4 translate-y-px rotate-45 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                : "w-4 translate-y-[-3px] rotate-0 group-hover:w-5"
                        }`}
                    />
                    <span
                        className={`block h-0.5 bg-white transition-all duration-300 ${
                            isMenuOpen
                                ? "w-0 opacity-0"
                                : "w-3 opacity-100 group-hover:w-4"
                        }`}
                    />
                    <span
                        className={`block h-0.5 bg-white transition-all duration-500 ease-out ${
                            isMenuOpen
                                ? "-rotate-45 -translate-y-px w-4 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                : "w-4 translate-y-[3px] rotate-0 group-hover:w-5"
                        }`}
                    />
                </div>

                {/* Pulse Effect */}
                <div
                    className={`absolute inset-0 transition-all duration-300 ${
                        isMenuOpen
                            ? "opacity-0"
                            : "animate-ping bg-white/5 opacity-0 group-hover:opacity-100"
                    }`}
                />
            </div>
        </button>
    );
}
