module.exports = {
  purge: ['./src/**/*.js', './src/**/*.jsx', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans'],
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
  daisyui: {
    themes: ['lofi'],
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
  },
};
