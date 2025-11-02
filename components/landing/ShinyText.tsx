/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import type React from "react";

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
    text,
    disabled = false,
    speed = 5,
    className = "",
}) => (
    <div
        className={`inline-block bg-linear-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent ${disabled ? "" : "animate-shine"} ${className}`}
        style={{
            backgroundSize: "200% 100%",
            animationDuration: `${speed}s`,
        }}
    >
        {text}
    </div>
);

export default ShinyText;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         shine: {
//           '0%': { 'background-position': '100%' },
//           '100%': { 'background-position': '-100%' },
//         },
//       },
//       animation: {
//         shine: 'shine 5s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// };
