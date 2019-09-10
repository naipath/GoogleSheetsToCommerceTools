const fs = require("fs");
const { authorize, retrieveDataFromSheet } = require("./googlesheets");
const ct = require("./commercetools");

const { spreadsheetId, range, ...argv } = require("yargs")
  .option("spreadsheetId", {
    alias: "s",
    type: "string",
    demandOption: true
  })
  .option("range", {
    type: "string",
    default: "A:T"
  })
  .option("hostUrl", {
    type: "string",
    default: "https://auth.sphere.io"
  })
  .option("apiUrl", {
    type: "string",
    default: "https://api.sphere.io"
  })
  .option("clientId", {
    alias: "c",
    type: "string",
    demandOption: true
  })
  .option("clientSecret", {
    alias: "S",
    type: "string",
    demandOption: true
  })
  .option("projectScope", {
    type: "string",
    default: "manage_customers"
  })
  .option("projectKey", {
    alias: "k",
    type: "string",
    demandOption: true
  }).argv;

const main = async () => {
  const content = fs.readFileSync("credentials.json");
  const auth = await authorize(JSON.parse(content));
  const values = await retrieveDataFromSheet(auth, spreadsheetId, range);

  const commercetoolsToken = await ct.authenticate(argv);
  await ct.saveCustomers(argv, commercetoolsToken, values.slice(0, 1));
};

main().catch(err => console.error(err));
