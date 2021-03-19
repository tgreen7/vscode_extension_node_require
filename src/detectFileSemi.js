const isRequire = require("./isRequire");

module.exports = function (codeBlock) {
  for (let i = 0; i < codeBlock.length; i += 1) {
    const line = codeBlock[i];
    if (isRequire(line) && line.match(/;/)) return ";";
  }

  return false;
};
