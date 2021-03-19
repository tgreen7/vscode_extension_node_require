const fs = require("fs");
const path = require("path");

function readFileIntoLineArray(filePath) {
  const file = path.resolve(`${__dirname}/${filePath}`);
  return fs.readFileSync(file).toString().split("\n");
}

module.exports = {
  readFileIntoLineArray,
};
