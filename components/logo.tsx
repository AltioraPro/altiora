import Image, { type ImageProps } from "next/image";

export const Logo = ({
    className = "h-10 w-auto",
    src = "/img/logo.png",
    ...props
}: Partial<ImageProps>) => (
    <Image
        {...props}
        alt="Altiora Logo"
        className={className}
        height={20}
        priority
        src={src}
        width={70}
    />
);
