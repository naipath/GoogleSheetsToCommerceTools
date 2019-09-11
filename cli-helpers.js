const readline = require("readline");

const log = console.log;
const redLog = (msg, ...rest) => log(`\x1b[31m${msg}\x1b[0m`, ...rest);
const greenLog = (msg, ...rest) => log(`\x1b[32m${msg}\x1b[0m`, ...rest);

const waitForInput = query =>
  new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return rl.question(query, ans => {
      rl.close();
      resolve(ans);
    });
  });

module.exports = {
  log,
  redLog,
  greenLog,
  waitForInput
};
