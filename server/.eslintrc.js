module.exports = {
  extends: 'next/core-web-vitals',
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './']],
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
      },
    },
  },
};
