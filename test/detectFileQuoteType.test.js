const detectFileQuoteType = require("../src/detectFileQuoteType");

describe("detectFileQuoteType", () => {
  it("import file with double quotes", () => {
    const codeBlocks = ['import test from "test"'];
    const quoteType = detectFileQuoteType(codeBlocks);
    expect(quoteType).to.equal('"');
  });

  it("import file with single quotes", () => {
    const codeBlocks = ["import test from 'test'"];
    const quoteType = detectFileQuoteType(codeBlocks);
    expect(quoteType).to.equal("'");
  });

  it("cannot find require statement", () => {
    const quoteType = detectFileQuoteType(["const a = 1"]);
    expect(quoteType).to.equal(false);
  });

  it("require with single quotes", () => {
    const codeBlocks = ["const a = require('single')"];
    const quoteType = detectFileQuoteType(codeBlocks);
    expect(quoteType).to.equal("'");
  });

  it("require with double quotes", () => {
    const codeBlocks = ['const a = require("single")'];
    const quoteType = detectFileQuoteType(codeBlocks);
    expect(quoteType).to.equal('"');
  });
});
