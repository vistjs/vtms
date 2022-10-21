const vm = require('vm');
const fetch = require('node-fetch');

module.exports = async function curl(fetchCode) {
  const script = new vm.Script(fetchCode);

  const p = script.runInThisContext();

  return (await p).status;
};
