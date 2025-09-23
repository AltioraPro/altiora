/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
	'./pages/**/*.{js,ts,jsx,tsx,mdx}',
	'./components/**/*.{js,ts,jsx,tsx,mdx}',
	'./app/**/*.{js,ts,jsx,tsx,mdx}',
	'./node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
],
theme: {
	extend: {
		colors: {
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			'primary-complex': {
				'50': '#f8f8f8',
				'100': '#f0f0f0',
				'200': '#e0e0e0',
				'300': '#c0c0c0',
				'400': '#a0a0a0',
				'500': '#808080',
				'600': '#606060',
				'700': '#404040',
				'800': '#202020',
				'900': '#000000',
				DEFAULT: '#000000'
			},
			'pure-white': '#ffffff',
			'pure-black': '#000000',
			glass: {
				light: 'rgba(255, 255, 255, 0.1)',
				medium: 'rgba(255, 255, 255, 0.15)',
				heavy: 'rgba(255, 255, 255, 0.2)',
				border: 'rgba(255, 255, 255, 0.15)',
				shadow: 'rgba(0, 0, 0, 0.1)'
			},
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			chart: {
				'1': 'hsl(var(--chart-1))',
				'2': 'hsl(var(--chart-2))',
				'3': 'hsl(var(--chart-3))',
				'4': 'hsl(var(--chart-4))',
				'5': 'hsl(var(--chart-5))'
			}
		},
		keyframes: {
			shine: {
				'0%': {
					'background-position': '100%'
				},
				'100%': {
					'background-position': '-100%'
				}
			},
			'liquid-shimmer': {
				'0%': {
					transform: 'translateX(-100%)'
				},
				'50%': {
					transform: 'translateX(0%)'
				},
				'100%': {
					transform: 'translateX(100%)'
				}
			},
			'liquid-ripple': {
				'0%': {
					width: '0',
					height: '0',
					opacity: '1'
				},
				'100%': {
					width: '300px',
					height: '300px',
					opacity: '0'
				}
			},
						'glass-float': {
				'0%, 100%': {
					transform: 'translateY(0px)'
				},
				'50%': {
					transform: 'translateY(-2px)'
				}
			},
			'scroll': {
				'to': {
					transform: 'translate(calc(-50% - 0.5rem))'
				}
			}
		},
				animation: {
			shine: 'shine 5s linear infinite',
			'liquid-shimmer': 'liquid-shimmer 4s ease-in-out infinite',
			'liquid-ripple': 'liquid-ripple 0.6s ease-out',
			'glass-float': 'glass-float 3s ease-in-out infinite',
			'scroll': 'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite'
		},
		backdropBlur: {
			glass: '12px',
			'glass-light': '8px',
			'glass-heavy': '16px'
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		}
	}
},
plugins: [require("tailwindcss-animate")],
} 