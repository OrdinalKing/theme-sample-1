/** @type {import('tailwindcss').Config} */
module.exports = {
  // sample2/ (the original static pages) is deliberately not scanned.
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: {
    // No Tailwind reset, so the converted pages keep their original look.
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
