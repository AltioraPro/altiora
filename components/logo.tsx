import type { SVGProps } from "react";

export const Logo = ({
    className,
    ...props
}: Partial<SVGProps<SVGSVGElement>>) => (
    <svg
        className={className}
        fill="currentColor"
        height="376"
        viewBox="0 0 611 376"
        width="611"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <title>Altiora Logo</title>
        <path
            d="M610.318 290.011L424.403 0.836182L287.442 161.122H248.939C156.403 245.168 101.06 291.599 0.318359 374.836L43.7719 353.355C92.2093 324.402 158.181 272.936 162.032 270.182L252.239 189.764H286.892L418.903 41.0453L393.601 162.774L246.739 312.044L218.136 329.119L232.437 303.782L147.73 356.109L247.839 329.67L411.752 214.55L378.199 282.851L444.205 222.813L451.355 155.063L511.31 244.845L491.509 192.518L610.318 290.011Z"
            fill="url(#paint0_linear_138_1371)"
            stroke="#DDDDDD"
        />
        <defs>
            <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_138_1371"
                x1="328.695"
                x2="305.254"
                y1="1.38699"
                y2="374.832"
            >
                <stop stopColor="#E3E5E7" />
                <stop offset="1" stopColor="#343739" />
            </linearGradient>
        </defs>
    </svg>
);
