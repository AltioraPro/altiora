/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import React from 'react';

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className = '' }) => {
    return (
        <div
            className={`inline-block ${className}`}
            style={{
                backgroundImage: 'linear-gradient(120deg, rgba(128, 128, 128, 1) 40%, rgba(255, 255, 255, 1) 50%, rgba(128, 128, 128, 1) 60%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: disabled ? 'none' : `shine ${speed}s linear infinite`,
            }}
        >
            {text}
        </div>
    );
};

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