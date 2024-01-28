module.exports = {
  purge: ['./src/**/*.js', './src/**/*.jsx', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        'RocaOne': ['RocaOne', 'sans'],
        'RocaTwo': ['RocaTwo', 'sans'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("daisyui")], 
}
