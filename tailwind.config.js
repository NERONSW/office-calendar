/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        outlook: {
          blue: '#0078d4',
          hover: '#106ebe',
          lightBg: '#f3f2f1',
          darkBg: '#1e1e1e',
          borderLight: '#edebe9',
          borderDark: '#333333',
        },
      },
    },
  },
  plugins: [],
};
