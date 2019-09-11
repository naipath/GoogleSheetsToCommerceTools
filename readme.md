# GoogleSheetsToCommerceTools

This node scripts allows a google sheet with customer data to be exported to CommerceTools.

Go to https://developers.google.com/sheets/api/quickstart/nodejs click on `ENABLE THE GOOGLE SHEETS API` and save the credentials.json file in this project.

Run using: 
```
npm i && node main -s <sheet-id> -c <commercetools id> -S <commercetools secret> -k <commercetools projectkey>
```