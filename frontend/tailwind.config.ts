import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f0f4ff',100:'#dce6ff',200:'#b9cdff',300:'#85a8ff',400:'#4d7bff',500:'#1a50ff',600:'#0030f5',700:'#0027cc',800:'#0020a3',900:'#001880',950:'#000e50' },
        accent: { DEFAULT:'#f59e0b', dark:'#d97706' },
      },
      fontFamily: {
        display: ['"Sora"','sans-serif'],
        body: ['"DM Sans"','sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
};
export default config;
