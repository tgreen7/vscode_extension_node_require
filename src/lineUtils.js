const _ = require("lodash");

module.exports = {
  isCommentOrEmpty: function (line) {
    return (
      _.isEmpty(line) ||
      line.match(/^\s*\/\//) ||
      line.match(/^\s*["']use strict["']/)
    );
  },
  isLocalRequire: function (line) {
    return (
      line.match(/require\([\s]?['|"][.|/]/) ||
      line.match(/^import.*from\s['|"][.|/]/) ||
      // special case for statements like: import './style.css'
      line.match(/^import.*\s['|"][.|/]/)
    );
  },
  isNamedImport: function (line) {
    return line.match(/^import.*{/);
  },
  isNamedImportEnd: function (line) {
    return line.match(/^.*from\s['|"]/);
  },
  isLocalNamedImportEnd: function (line) {
    return line.match(/^.*from\s['|"][.|/]/);
  },
  isStartOfBlockComment: function (line) {
    return line.match(/^\s*\/\*/);
  },
  isEndOfBlockComment: function (line) {
    return line.match(/^.*\*\//);
  },
  isStyleRequire: function (line) {
    return line.match(/^\s*import ['|"].*['|"]/);
  },
  isShebang: function (line) {
    return line.match(/^\s*#!/);
  },
};
