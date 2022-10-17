const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

module.exports = async ({ reference, imageData, width, height }) => {
  const diff = new PNG({ width, height });
  const png1 = PNG.sync.read(Buffer.from(reference, 'base64'));
  const png2 = PNG.sync.read(Buffer.from(imageData, 'base64'));
  const numDiffPixels = pixelmatch(
    png1.data,
    png2.data,
    diff.data,
    width,
    height,
    {
      threshold: 0,
    },
  );
  return numDiffPixels > 0 ? PNG.sync.write(diff).toString('base64') : '';
};
