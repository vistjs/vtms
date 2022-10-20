const path = require('path');
const Piscina = require('piscina');

const pool = new Piscina({
  filename: path.resolve('./utils/imgDiffWorker.js'),
});

module.exports = async function diffImages(
  references,
  imageDatas,
  width,
  height,
) {
  const diffs = [];
  const promises = references.map(async (reference, index) => {
    return await pool.run({
      reference,
      imageData: imageDatas[index],
      width,
      height,
    });
  });
  for (const promise of promises) {
    diffs.push(await promise);
  }
  return diffs;
};
