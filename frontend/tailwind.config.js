/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          dark: 'var(--secondary-dark)',
          light: 'var(--secondary-light)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dark: 'var(--accent-dark)',
          light: 'var(--accent-light)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        bg: {
          DEFAULT: 'var(--bg)',
          card: 'var(--bg-card)',
          border: 'var(--bg-border)',
          hover: 'var(--bg-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          muted: 'var(--text-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
