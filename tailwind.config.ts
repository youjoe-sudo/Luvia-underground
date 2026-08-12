import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#3F2CD9',
          cyan: '#2C9DFC',
          electric: '#4040EB',
          bg: '#000412',
          card: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3F2CD9 0%, #2C9DFC 100%)',
        'electric-gradient': 'linear-gradient(135deg, #4040EB 0%, #3F2CD9 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
