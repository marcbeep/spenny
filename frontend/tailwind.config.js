module.exports = {
  purge: ['./src/**/*.js', './src/**/*.jsx', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans'],
      },
      fontWeight: {
        normal: 500,
        bold: 700,
        black: 900,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
