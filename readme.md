# GoogleSheetsToCommerceTools

This tool allows you to import a google sheet with customer data and export it to CommerceTools.

Go to https://developers.google.com/sheets/api/quickstart/nodejs click on `ENABLE THE GOOGLE SHEETS API` and save the credentials.json file in the directory where you run this tool.

## Install


```
npm i -g googlesheetstocommercetools
```

## Run


```
googlesheetstocommercetools -s <sheet-id> -c <commercetools id> -S <commercetools secret> -k <commercetools projectkey>
```

## Licence

Licenced under the [MIT licence](LICENCE)
