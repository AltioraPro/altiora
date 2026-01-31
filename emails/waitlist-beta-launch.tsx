import { Logomark } from "./common/logomark";
import { Card } from "./components/card";
import { EmailButton } from "./components/email-button";
import { EmailLayout } from "./components/email-layout";
import { EmailFooter, EmailHeading, EmailText } from "./components/email-text";

interface WaitlistBetaLaunchProps {
    firstName: string;
}

export default function WaitlistBetaLaunchTemplate({
    firstName,
}: WaitlistBetaLaunchProps) {
    return (
        <EmailLayout previewText="La beta Altiora est ouverte !">
            <div className="flex w-full items-center justify-center">
                <Logomark />
            </div>

            <Card>
                <EmailHeading>La beta est ouverte !</EmailHeading>
                <EmailText>Salut {firstName},</EmailText>
                <EmailText>
                    L&apos;attente est terminée ! Tu peux maintenant créer ton
                    compte sur Altiora.
                </EmailText>
                <EmailText className="font-medium">
                    Ce qui t&apos;attend :
                </EmailText>
                <ul className="list-disc pl-6 text-neutral-300">
                    <li>Suivi de tes trades avec analytics détaillés</li>
                    <li>Journal de trading personnalisé</li>
                    <li>Objectifs et habitudes pour progresser</li>
                </ul>

                <EmailButton href="https://altiora.pro/register">
                    Créer mon compte
                </EmailButton>
            </Card>

            <EmailFooter />
        </EmailLayout>
    );
}

WaitlistBetaLaunchTemplate.PreviewProps = {
    firstName: "Thomas",
} as WaitlistBetaLaunchProps;
