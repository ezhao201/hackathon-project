/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1E3A5F',
          50: '#EEF3F9',
          100: '#D6E1EF',
          200: '#ADC3DF',
          300: '#7FA0C9',
          400: '#4F79AB',
          500: '#2F5683',
          600: '#1E3A5F',
          700: '#182F4D',
          800: '#12243B',
          900: '#0C1829',
        },
        accent: {
          DEFAULT: '#22C55E',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)',
        'card-hover': '0 4px 6px -1px rgba(16, 24, 40, 0.08), 0 10px 15px -3px rgba(16, 24, 40, 0.1)',
      },
    },
  },
  plugins: [],
};
