module.exports = function isRequire(line) {
  return line.match(/require\(/) || line.match(/^import/);
};
