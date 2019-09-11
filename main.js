const fs = require("fs");
const gs = require("./googlesheets");
const ct = require("./commercetools");

const { spreadsheetId, range, ...argv } = require("yargs")
  .usage("Import customers from a Google Sheet into CommerceTools")
  .option("spreadsheetId", {
    alias: "s",
    describe: "Google Spreadsheet id that contains customers",
    type: "string",
    demandOption: true
  })
  .option("range", {
    type: "string",
    default: "A:T",
    describe: "Range to look up in the Google Spreadsheet"
  })
  .option("hostUrl", {
    type: "string",
    default: "https://auth.sphere.io",
    describe: "Authentication endpoint for Commercetools"
  })
  .option("apiUrl", {
    type: "string",
    default: "https://api.sphere.io",
    describe: "Api endpoint for Commercetools"
  })
  .option("clientId", {
    alias: "c",
    type: "string",
    demandOption: true,
    describe: "Commercetools client id"
  })
  .option("clientSecret", {
    alias: "S",
    type: "string",
    demandOption: true,
    describe: "Commercetools client secret"
  })
  .option("projectKey", {
    alias: "k",
    type: "string",
    demandOption: true,
    describe: "Commercetools project to export the customers to"
  })
  .option("projectScope", {
    type: "string",
    default: "manage_customers",
    describe: "Scope for commercetools, must be at least manage_customers"
  }).argv;

const main = async () => {
  const auth = await gs.authorize();
  const values = await gs.retrieveDataFromSheet(auth, spreadsheetId, range);

  const commercetoolsToken = await ct.authenticate(argv);
  await ct.saveCustomers(argv, commercetoolsToken, values.slice(0, 1));
};

main().catch(err => console.error(err));
