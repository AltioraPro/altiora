import { Button, Link } from "@react-email/components";
import { PROJECT } from "@/constants/project";
import { getEmailUrl } from "@/lib/urls";
import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

interface WaitlistApprovedTemplateProps {
    signUpUrl: string;
    email?: string;
    discordUrl?: string;
}

const baseUrl = getEmailUrl();

export default function WaitlistApprovedTemplate({
    signUpUrl,
    email,
    discordUrl,
}: WaitlistApprovedTemplateProps) {
    return (
        <EmailLayout
            previewText={`Welcome to ${PROJECT.NAME} - Your waitlist application has been approved`}
        >
            <div className="flex w-full items-center justify-center">
                <Logomark logoUrl={`${baseUrl}/img/logo.png`} />
            </div>

            <Card>
                <EmailHeading>{`Welcome to ${PROJECT.NAME} !`}</EmailHeading>

                <EmailText>
                    {
                        "Great news! Your waitlist application has been approved, and we're thrilled to have you join our community."
                    }
                </EmailText>

                <EmailText>
                    You're just moments away from transforming your productivity
                    and trading journey.
                </EmailText>

                <EmailText>
                    Click the button below to create your account and begin your
                    journey.
                </EmailText>

                <EmailButton href={signUpUrl}>{"Get Started"}</EmailButton>

                <EmailText className="text-neutral-500 text-sm">
                    {
                        "Your account will be activated immediately after registration. No credit card required."
                    }
                </EmailText>
                {email && (
                    <EmailText className="text-neutral-500 text-sm">
                        If you need any help, you can contact us at{" "}
                        <Link
                            className="text-blue-500 underline"
                            href={`mailto:${email}`}
                        >
                            {email}
                        </Link>
                    </EmailText>
                )}

                {discordUrl && (
                    <>
                        <EmailText className="mt-8 mb-4">
                            {"Join our community"}
                        </EmailText>

                        <EmailText className="mb-4">
                            {
                                "Connect with fellow traders and productivity enthusiasts in our Discord server. Share insights, get support, and stay updated on the latest features."
                            }
                        </EmailText>

                        <Button
                            className="inline-block border border-neutral-700 px-3 py-2 font-medium text-neutral-700 text-sm no-underline"
                            href={discordUrl}
                        >
                            {"Join Discord Community"}
                        </Button>
                    </>
                )}
            </Card>
            <EmailFooter />
        </EmailLayout>
    );
}

WaitlistApprovedTemplate.PreviewProps = {
    signUpUrl: "https://example.com/register",
    email: "noreply@altiora.pro",
} as WaitlistApprovedTemplateProps;
