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
  let candidateBeforeNamedImport = 0;
  let findingNamedImportEnd = false;
  let findingBlockCommentEnd = false;
  let importOrRequireHit = false;

  for (let i = 0; i < codeBlock.length; i++) {
    const line = codeBlock[i];
    if (findingNamedImportEnd) {
      if (isNamedImportEnd(line)) {
        if (isLocalNamedImportEnd(line) && placeWithExternals) {
          return candidateBeforeNamedImport;
        }
        findingNamedImportEnd = false;
      }
      candidate = i + 1;
    } else if (findingBlockCommentEnd) {
      if (isEndOfBlockComment(line)) findingBlockCommentEnd = false;
      candidate = i + 1;
    } else if (isStartOfBlockComment(line) && !isEndOfBlockComment(line)) {
      // if a block comment is found below the require/import statements
      if (importOrRequireHit) break;
      findingBlockCommentEnd = true;
      candidate = i + 1;
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
        findingNamedImportEnd = true;
        candidateBeforeNamedImport = i;
      } else candidate = i + 1;
      importOrRequireHit = true;
    } else if (!isCommentOrEmpty(line)) {
      break;
    }
  }

  // if the before where we are about to place the require statement ends with an open paren
  // then we need to keep going until we close it
  /**
   * this handles requires like this
   * const debug = require("debug")(
      `${process.env.APP_NAME}:controllers/${path.basename(__filename)}`
    );
   */
  const lineBeforeProposed = candidate - 1;
  if (
    codeBlock[lineBeforeProposed] &&
    codeBlock[lineBeforeProposed].trim().match(/\($/)
  ) {
    let parensToClose = 1;
    while (candidate < codeBlock.length) {
      const lineAfter = codeBlock[candidate];
      parensToClose = parensToClose + (lineAfter.match(/\(/g) || []).length;
      const numClosingParens = (lineAfter.match(/\)/g) || []).length;
      parensToClose = parensToClose - numClosingParens;
      candidate++;
      if (parensToClose === 0) {
        break;
      }
    }
  }

  return candidate;
};
