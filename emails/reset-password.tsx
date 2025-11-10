import { getEmailUrl } from "@/lib/urls";
import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

interface ResetPasswordTemplateProps {
    url: string;
    host: string;
    name: string;
}

const baseUrl = getEmailUrl();

export default function ResetPasswordTemplate({
    url,
    host,
    name,
}: ResetPasswordTemplateProps) {
    return (
        <EmailLayout previewText={`Reset your password for ${host}`}>
            <div className="flex w-full items-center justify-center">
                <Logomark logoUrl={`${baseUrl}/img/logo.png`} />
            </div>

            <Card>
                <EmailHeading>Reset Your Password</EmailHeading>

                <EmailText>
                    {name ? `Hi ${name},` : "Hi,"} we received a request to
                    reset your password. Click the button below to create a new
                    password.
                </EmailText>

                <EmailButton href={url}>Reset Password</EmailButton>

                <EmailText className="text-center text-neutral-500 text-sm">
                    This link will expire in 1 hour.
                </EmailText>

                <EmailText className="mt-4 text-center text-neutral-500 text-sm">
                    If you didn't request this password reset, please ignore
                    this email.
                </EmailText>
            </Card>

            <EmailFooter />
        </EmailLayout>
    );
}

ResetPasswordTemplate.PreviewProps = {
    url: "https://example.com/reset-password?token=abc123",
} as ResetPasswordTemplateProps;
