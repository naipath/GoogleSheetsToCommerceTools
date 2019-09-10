const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = "token.json";

const getNewToken = (oAuth2Client, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
};

const authorize = async credentials =>
  new Promise(resolve => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      resolve(oAuth2Client);
    });
  });

const retrieveDataFromSheet = (auth, spreadsheetId, range) =>
  new Promise((resolve, reject) => {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get({ spreadsheetId, range }, (err, res) => {
      if (err) {
        reject(err);
        return console.log("The API returned an error: " + err);
      }
      const rows = res.data.values;
      const parsedRows = rows.slice(1).map(row =>
        rows[0].reduce(
          (acc, cur, index) => ({
            ...acc,
            [cur]: row[index]
          }),
          {}
        )
      );
      resolve(parsedRows);
    });
  });

module.exports = {
  retrieveDataFromSheet,
  authorize
};
