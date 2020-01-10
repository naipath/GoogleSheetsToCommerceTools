const fs = require("fs");
const gs = require("./src/googlesheets");
const CommerceToolsClient = require("./src/commercetools");
const { waitForInput, log, greenLog, redLog } = require("./src/cli-helpers");

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

  log("Retrieving values from spread sheet");
  const values = await gs.retrieveDataFromSheet(auth, spreadsheetId, range);

  greenLog("Total customers exported from spread sheet:", values.length);

  await waitForInput("Proceed?");

  const ct = new CommerceToolsClient(argv);
  await ct.init();

  const unsuccessfulSaves = [];

  for (const customer of values) {
    try {
      const result = await ct.saveCustomer(customer);
      const customerId = result.customer.id;

      await ct.saveRegisteredDevice(customer, customerId);
      await ct.saveCommunicationChannels(customer, customerId);

      greenLog("Saved customer: ", customerId);
    } catch (e) {
      unsuccessfulSaves.push({ ...customer, reason: e.message });
      redLog(
        "Failed to save customer: ",
        e.message.substr(0, e.message.indexOf("\n"))
      );
    }
  }

  if (unsuccessfulSaves.length > 0) {
    redLog("Customers failed to save:", unsuccessfulSaves.length);
    log("Saved errors to file: ./errors.json");
    fs.writeFileSync("errors.json", JSON.stringify(unsuccessfulSaves, null, 2));
  }

  greenLog(
    "Finished, total customers imported: ",
    values.length - unsuccessfulSaves.length
  );
};

main().catch(redLog);
