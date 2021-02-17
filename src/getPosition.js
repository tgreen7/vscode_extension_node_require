const isRequire = require("./isRequire");
const {
  isNamedImport,
  isEndOfBlockComment,
  isStartOfBlockComment,
  isNamedImportEnd,
  isLocalNamedImportEnd,
  isStyleRequire,
  isLocalRequire,
  isCommentOrEmpty,
  isShebang,
} = require("./lineUtils");

module.exports = function (codeBlock, placeWithExternals) {
  let candidate = 0;
  let importOrRequireHit = false;

  for (let i = 0; i < codeBlock.length; i++) {
    const line = codeBlock[i];
    if (isStartOfBlockComment(line) && !isEndOfBlockComment(line)) {
      // if a block comment is found below the require/import statements
      if (importOrRequireHit) break;
      candidate = i + 1;
      while (candidate < codeBlock.length) {
        const cur = codeBlock[candidate];
        candidate++;
        i++;
        if (isEndOfBlockComment(cur)) {
          break;
        }
      }
    } else if (isStartOfBlockComment(line) && isEndOfBlockComment(line)) {
      candidate = i + 1;
    } else if (isShebang(line)) {
      candidate = i + 1;
    } else if (
      isRequire(line) &&
      (!placeWithExternals || (placeWithExternals && !isLocalRequire(line)))
    ) {
      // require/imports should come before style imports
      if (isStyleRequire(line)) break;
      else if (isNamedImport(line) && !isNamedImportEnd(line)) {
        const candidateBeforeNamedImport = i;
        candidate = i + 1;
        while (candidate < codeBlock.length) {
          const cur = codeBlock[candidate];
          candidate++;
          i++;
          if (isNamedImportEnd(cur)) {
            if (isLocalNamedImportEnd(cur) && placeWithExternals) {
              return candidateBeforeNamedImport;
            }
            break;
          }
        }
      } else {
        // This require statement might be directly calling a function.
        // we would want to skip over this function call before continuing to find
        // the position
        /**
         * this handles requires like this
         * const debug = require("debug")(
            `${process.env.APP_NAME}:controllers/${path.basename(__filename)}`
          );
        */
        candidate = i + 1;
        if (line.trim().match(/\($/)) {
          let parensToClose = 1;
          while (candidate < codeBlock.length) {
            const lineAfter = codeBlock[candidate];
            parensToClose =
              parensToClose + (lineAfter.match(/\(/g) || []).length;
            const numClosingParens = (lineAfter.match(/\)/g) || []).length;
            parensToClose = parensToClose - numClosingParens;
            candidate++;
            i++;
            if (parensToClose === 0) {
              break;
            }
          }
        }
      }
      importOrRequireHit = true;
    } else if (!isCommentOrEmpty(line)) {
      break;
    }
  }

  return candidate;
};
