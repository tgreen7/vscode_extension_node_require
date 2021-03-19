const constants = require("./constants");

module.exports = function (codeBlock) {
  for (let i = 0; i < codeBlock.length; i += 1) {
    const line = codeBlock[i];
    if (line.match(/^import/)) return constants.TYPE_IMPORT;
    if (line.match(/require\(/)) return constants.TYPE_REQUIRE;
  }

  return null;
};
