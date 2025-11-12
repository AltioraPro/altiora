import { Img } from "@react-email/components";

interface LogoProps {
    className?: string;
    src?: string;
}

export function Logo({ className, src }: LogoProps) {
    return (
        <Img
            alt="Altiora Logo"
            className={className}
            src={src || "/img/logo.png"}
        />
    );
}
