module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    // PostCSS plugins for production optimization
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: false,
        }]
      }
    } : {})
  },
}