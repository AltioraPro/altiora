import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

interface WaitlistConfirmationProps {
    firstName: string;
}

export default function WaitlistConfirmationTemplate({
    firstName,
}: WaitlistConfirmationProps) {
    return (
        <EmailLayout previewText="Bienvenue sur la waitlist Altiora !">
            <div className="flex w-full items-center justify-center">
                <Logomark />
            </div>

            <Card>
                <EmailHeading>Bienvenue sur la waitlist !</EmailHeading>
                <EmailText>Salut {firstName},</EmailText>
                <EmailText>
                    Merci de ton intérêt pour Altiora ! Tu es maintenant sur la
                    liste d&apos;attente.
                </EmailText>
                <EmailText>
                    On te préviendra dès que la beta sera ouverte.
                </EmailText>
            </Card>

            <EmailFooter />
        </EmailLayout>
    );
}

WaitlistConfirmationTemplate.PreviewProps = {
    firstName: "Thomas",
} as WaitlistConfirmationProps;
