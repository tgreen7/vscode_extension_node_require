const _ = require("lodash");

module.exports = function (originalName, preserveAcronymCase) {
  if (preserveAcronymCase) {
    const caseName = _.startCase(originalName).split(" ").join("");

    if (/^[a-z]/.test(originalName)) {
      return _.lowerFirst(caseName);
    }

    return caseName;
  } else {
    const match = originalName.match(/[a-zA-Z]/);
    let stringToUse = originalName;
    let specialStartingCharacters = "";
    if (match && match.index !== 0) {
      specialStartingCharacters = originalName.slice(0, match.index);
      stringToUse = stringToUse.slice(match.index);
    }
    const camel = _.camelCase(stringToUse);
    const fixedCase =
      specialStartingCharacters + stringToUse.slice(0, 1) + camel.slice(1);
    return fixedCase;
  }
};
