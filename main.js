const waitForInput = require("./wait-for-input");
const gs = require("./googlesheets");
const ct = require("./commercetools");
const log = console.log;

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
  log("Authorizing with google");
  const auth = await gs.authorize();

  log("Retrieving values from spread sheet");
  const values = await gs.retrieveDataFromSheet(auth, spreadsheetId, range);
  log("Total amount of customers to export:", values.length - 1);

  await waitForInput("Continue?");

  const commercetoolsToken = await ct.authenticate(argv);
  for (const customer of values.slice(0, 1)) {
    await ct.saveCustomer(argv, commercetoolsToken, customer);
    console.log("Saved customer: ", customer.email);
  }
};

main().catch(err => console.error(err));
