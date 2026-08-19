import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#213a4a',
        lake: '#385772',
        moss: '#567260',
        paper: '#f8faf7',
        clay: '#875a41',
      },
      fontFamily: {
        display: ['Songti SC', 'STSong', 'Noto Serif CJK SC', 'serif'],
        sans: ['Avenir Next', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
      },
      boxShadow: {
        paper: '0 18px 50px rgb(31 63 44 / 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config;
