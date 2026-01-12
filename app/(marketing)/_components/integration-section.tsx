import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { RiDiscordFill, RiLinksLine, RiShareFill } from "@remixicon/react";
import { Section } from "./section";

interface IntegrationSectionProps {
    id?: string;
}

export function IntegrationSection({ id }: IntegrationSectionProps) {
    return (
        <Section
            className="mt-40 flex min-h-96 items-center justify-center gap-12"
            id={id}
        >
            <div className="relative flex w-full max-w-[600px] justify-center pb-8">
                <div className="absolute right-0 bottom-0 left-0 h-52 bg-neutral-900" />
                <div className="z-10 flex w-fit flex-col items-center justify-center gap-8 border border-neutral-800 bg-background p-8 pb-9 shadow-md">
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="flex items-center justify-center gap-2.5 bg-neutral-800 py-1 pr-2.5 pl-2 text-neutral-400 text-sm">
                            <RiShareFill className="size-4" />
                            <span>Integrations</span>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <div className="-translate-x-1 flex size-[72px] items-center justify-center">
                                <Logo className="h-8 w-fit" />
                            </div>
                            <div className="flex size-9 items-center justify-center rounded-full bg-neutral-800">
                                <RiLinksLine className="size-5 text-neutral-300" />
                            </div>
                            <div className="flex size-[72px] items-center justify-center">
                                <RiDiscordFill className="h-10 w-fit" />
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full max-w-72 flex-col items-center justify-center gap-6">
                        <div className="text-center">
                            <p className="text-lg">Get connected to Discord</p>
                            <p className="mt-2 text-neutral-600 text-sm">
                                Join our Discord server and enable deepwork
                                sessions by linking your account.
                            </p>
                        </div>

                        <Button
                            className="pointer-events-none"
                            tabIndex={-1}
                            variant="primary"
                        >
                            Link your account
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <h2 className="text-2xl">
                    Unlock the full potential of Altiora
                </h2>
                <p className="max-w-[470px] text-center text-neutral-600 text-sm">
                    Connect Altiora to Discord, track your deepwork sessions and
                    get insights on your productivity.
                </p>
            </div>
        </Section>
    );
}
