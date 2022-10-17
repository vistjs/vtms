module.exports = {
  extends: ['next/babel', 'next/core-web-vitals'],
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './']],
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
      },
    },
  },
};
