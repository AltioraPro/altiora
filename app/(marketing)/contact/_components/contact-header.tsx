export const ContactHeader = () => (
    <div className="relative">
        <div className="-top-8 -left-8 absolute h-16 w-16 animate-pulse rounded-full border border-white/20" />
        <div className="-top-4 -left-4 absolute h-8 w-8 rotate-45 bg-white/10" />

        <h1 className="mb-8 bg-linear-to-b from-white via-white to-gray-400 bg-clip-text text-right font-bold text-[8vw] text-transparent leading-none lg:text-[6vw]">
            CONTACT
            <br />
            <span className="relative inline-block text-white">
                <span className="-left-96 -translate-y-1/2 absolute top-1/2 h-px w-96 transform bg-linear-to-r from-transparent to-white/60" />
                US
            </span>
        </h1>

        <div className="flex">
            <div className="relative h-20 w-20 rounded-full border border-white/30">
                <div
                    className="absolute inset-0 animate-spin rounded-full border border-white/10"
                    style={{ animationDuration: "20s" }}
                />
                <div
                    className="absolute inset-2 animate-spin rounded-full border border-white/20"
                    style={{
                        animationDuration: "15s",
                        animationDirection: "reverse",
                    }}
                />
                <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-1 w-1 transform rounded-full bg-white" />

                <div className="-right-12 absolute top-1/2 h-px w-12 bg-linear-to-r from-white/60 to-transparent" />
                <div className="-left-12 absolute top-1/2 h-px w-12 bg-linear-to-l from-white/60 to-transparent" />
            </div>
        </div>
    </div>
);
