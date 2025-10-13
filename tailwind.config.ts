import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      serif: ['var(--font-playfair)', 'Georgia', 'Times New Roman', 'serif'],
      display: ['var(--font-playfair)', 'Georgia', 'serif'],
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        luxury: {
          black: "#0A0A0A",
          darkGray: "#1A1A1A",
          mediumGray: "#2D2D2D",
          lightGray: "#B8B8B8",
          gold: "#D4AF37",
          goldLight: "#E5C76B"
        }
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 20s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slideUp': 'slideUp 0.3s ease-out',
        'marquee': 'marquee 15s linear infinite',
        'marquee-reverse': 'marquee-reverse 15s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
            opacity: '0.2',
          },
          '25%': {
            transform: 'translateY(-30px) translateX(20px)',
            opacity: '0.4',
          },
          '50%': {
            transform: 'translateY(-60px) translateX(-10px)',
            opacity: '0.6',
          },
          '75%': {
            transform: 'translateY(-30px) translateX(-30px)',
            opacity: '0.4',
          },
        },
        glow: {
          '0%': {
            'box-shadow': '0 0 5px rgba(212, 175, 55, 0.2), 0 0 10px rgba(212, 175, 55, 0.1)',
          },
          '100%': {
            'box-shadow': '0 0 20px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.2)',
          },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        marquee: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(-50%)',
          },
        },
        'marquee-reverse': {
          '0%': {
            transform: 'translateX(-50%)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;