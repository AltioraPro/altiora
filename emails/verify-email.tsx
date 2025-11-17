import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";
import { OtpDisplay } from "./components/otp-display";

interface VerifyEmailTemplateProps {
    otp: string;
    host: string;
    email: string;
}

export default function VerifyEmailTemplate({
    otp,
    host,
    email,
}: VerifyEmailTemplateProps) {
    return (
        <EmailLayout previewText="Verify your email address">
            <div className="flex w-full items-center justify-center">
                <Logomark />
            </div>

            <Card>
                <EmailHeading>One More Step</EmailHeading>
                <EmailText>
                    Thank you for signing up ! Complete your account setup by
                    verifying your email address.
                </EmailText>

                <OtpDisplay otp={otp} />

                <EmailButton
                    href={`https://${host}/verification?otp=${otp}&email=${email}`}
                >
                    Verify Email Address
                </EmailButton>

                <EmailText className="text-center text-neutral-500 text-sm">
                    This link will expire in 24 hours.
                </EmailText>

                <EmailText className="text-center text-neutral-500 text-sm">
                    If you didn't create this account, please ignore this email.
                </EmailText>
            </Card>

            <EmailFooter />
        </EmailLayout>
    );
}

VerifyEmailTemplate.PreviewProps = {
    otp: "123456",
    host: "https://example.com",
    email: "test@example.com",
} as VerifyEmailTemplateProps;
