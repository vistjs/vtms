module.exports = {
  "extends": "next/core-web-vitals",
  settings: {
    'import/resolver': {
      alias: {
        map: [['@/lib', './lib'], ['@/constant', './constant'], ['@/models', './models']],
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
      },
    },
  },
}
