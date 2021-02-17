const { readFileIntoLineArray } = require("./testUtils");
const getPosition = require("../src/getPosition");

describe("getPosition", () => {
  it("file with block comment", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithBlockComment.js"
    );
    const lineIndex = getPosition(codeBlocks);
    expect(lineIndex).to.equal(5);
  });

  it("relative import", () => {
    const codeBlocks = readFileIntoLineArray("testFiles/fileWithImports.js");
    const lineIndex = getPosition(codeBlocks);
    expect(lineIndex).to.equal(2);
  });

  it("external import", () => {
    const codeBlocks = readFileIntoLineArray("testFiles/fileWithImports.js");
    const lineIndex = getPosition(codeBlocks, true);
    expect(lineIndex).to.equal(1);
  });

  it("style import", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithImportsAndStyles.js"
    );
    const lineIndex = getPosition(codeBlocks);
    expect(lineIndex).to.equal(3);
  });

  it("gets correct position with multiline destructuring local", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithDestructuringImport.js"
    );
    const lineIndex = getPosition(codeBlocks);
    expect(lineIndex).to.equal(10);
  });

  it("gets correct position with multiple multiline destructuring local", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithDestructuringImportLocalAndExternal.js"
    );
    const lineIndex = getPosition(codeBlocks);
    expect(lineIndex).to.equal(12);
  });

  it("gets correct position with multiple multiline destructuring external", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithDestructuringImportLocalAndExternal.js"
    );
    const lineIndex = getPosition(codeBlocks, true);
    expect(lineIndex).to.equal(6);
  });

  it("gets correct position with multiline destructuring external", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithDestructuringImport.js"
    );
    const lineIndex = getPosition(codeBlocks, true);
    expect(lineIndex).to.equal(0);
  });

  it("gets correct position with multiline require statements", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithMultilineRequire.js"
    );
    const lineIndex = getPosition(codeBlocks, true);
    expect(lineIndex).to.equal(9);
  });

  it("gets correct position with multiline require statement with extra requires after", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithMultilineRequireAndExtras.js"
    );
    const lineIndex = getPosition(codeBlocks, false);
    expect(lineIndex).to.equal(6);
  });

  it("gets correct position with multiline require statement with extra requires after and relative requires", () => {
    const codeBlocks = readFileIntoLineArray(
      "testFiles/fileWithMultilineRequireAndExtrasAndRelatives.js"
    );
    const lineIndex = getPosition(codeBlocks, false);
    expect(lineIndex).to.equal(9);
  });
});
