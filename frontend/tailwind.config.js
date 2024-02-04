module.exports = {
  purge: ['./src/**/*.js', './src/**/*.jsx', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans'],
      },
      fontWeight: {
        light: 200,
        normal: 400,
        semibold: 600,
        bold: 800,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
