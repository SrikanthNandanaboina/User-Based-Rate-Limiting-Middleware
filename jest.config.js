const { resolve } = require("path");

module.exports = {
  rootDir: resolve(__dirname),
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
