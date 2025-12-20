import {
    RiAddLine,
    RiBugLine,
    RiLightbulbFlashLine,
    RiStarLine,
} from "@remixicon/react";
import { Header } from "@/components/header";
import { RELEASES } from "@/constants/releases";

export default function ChangelogPage() {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "feature":
                return <RiAddLine className="size-4 text-neutral-400" />;
            case "improvement":
                return (
                    <RiLightbulbFlashLine className="size-4 text-neutral-400" />
                );
            case "fix":
                return <RiBugLine className="size-4 text-neutral-400" />;
            default:
                return <RiStarLine className="size-4 text-neutral-500" />;
        }
    };

    const getVersionBadgeColor = (type: string) => {
        switch (type) {
            case "major":
                return "bg-neutral-800 text-neutral-300 border-neutral-700";
            case "minor":
                return "bg-neutral-800 text-neutral-300 border-neutral-700";
            case "patch":
                return "bg-neutral-800 text-neutral-300 border-neutral-700";
            default:
                return "bg-neutral-800 text-neutral-400 border-neutral-700";
        }
    };

    return (
        <div>
            <Header />

            <main className="scroll-target-container px-4">
                <div className="relative mx-auto w-full max-w-7xl overflow-hidden pt-20 pb-20">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-12">
                            <h1 className="mb-4 font-normal text-5xl text-neutral-50">
                                Changelog
                            </h1>
                            <p className="mt-4 text-neutral-400 text-sm">
                                Track all updates, improvements, and new
                                features
                            </p>
                        </div>

                        <div className="space-y-6">
                            {RELEASES.map((release, index) => (
                                <div
                                    className="overflow-hidden border border-neutral-800 bg-neutral-900"
                                    key={index}
                                >
                                    {/* Release Header */}
                                    <div className="border-neutral-800 border-b p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className={`rounded-full border px-3 py-1 font-medium text-xs ${getVersionBadgeColor(release.type)}`}
                                                >
                                                    v{release.version}
                                                </span>
                                                <span className="text-neutral-400 text-sm">
                                                    {new Date(
                                                        release.date
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <h2 className="font-medium text-neutral-50 text-xl">
                                            {release.title}
                                        </h2>
                                    </div>

                                    {/* Changes List */}
                                    <div className="p-6">
                                        <div className="space-y-3">
                                            {release.changes.map(
                                                (change, changeIndex) => (
                                                    <div
                                                        className="flex items-start gap-3"
                                                        key={changeIndex}
                                                    >
                                                        {getTypeIcon(
                                                            change.type
                                                        )}
                                                        <span className="flex-1 text-neutral-400 text-sm leading-relaxed">
                                                            {change.text}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
