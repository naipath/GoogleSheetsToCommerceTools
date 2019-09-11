const readline = require("readline");

module.exports = query =>
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
