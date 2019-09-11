const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const uuidv4 = require("uuid/v4");

const handle = errorMessage => async res => {
  const message = await res.json();
  if (res.ok) return message;
  throw new Error(
    `${errorMessage}: ${res.status}\n${JSON.stringify(message, null, 2)}`
  );
};

const authenticate = async ({
  hostUrl,
  clientId,
  clientSecret,
  projectScope,
  projectKey
}) => {
  const params = new URLSearchParams();
  params.append("grant_type", `client_credentials`);
  params.append("scope", `${projectScope}:${projectKey}`);

  const result = await fetch(`${hostUrl}/oauth/token`, {
    method: "POST",
    body: params,
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`
    }
  }).then(handle("Commercetools authentication failed"));

  return result["access_token"];
};

const saveCustomer = async ({ apiUrl, projectKey }, token, customer) =>
  fetch(`${apiUrl}/${projectKey}/customers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: customer.email,
      password: "Password1!" + new Date().getTime(),
      firstName: customer.firstName,
      middleName: customer.middleName,
      lastName: customer.lastName,
      title: customer.title,
      salutation: customer.title,
      locale: customer.language,
      dateOfBirth: customer.dateOfBirth,
      address: [
        {
          country: customer.country,
          phone: customer.phoneNumber,
          mobile: customer.mobilePhoneNumber,
          city: customer.city,
          postalCode: customer.postalCode,
          streetName: customer.streetName,
          streetNumber: customer.streetNumber,
          email: customer.email
        }
      ]
    })
  }).then(handle("Saving the customer failed"));

const saveCustomObject = ({ apiUrl, projectKey }, token, customObject) =>
  fetch(`${apiUrl}/${projectKey}/custom-objects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(customObject)
  }).then(
    handle(
      `Saving the custom object failed, container: ${customObject.container}`
    )
  );

const saveCommunicationChannels = (config, token, customer, customerId) =>
  saveCustomObject(config, token, {
    container: "communicationChannels",
    key: customerId,
    value: {
      directMail: customer.agreeNewsletter === "True",
      textMessage: customer.agreeNewsletter === "True",
      phone: customer.agreeNewsletter === "True",
      email: customer.agreeNewsletter === "True"
    }
  });

const saveRegisteredDevice = (config, token, customer, customerId) =>
  saveCustomObject(config, token, {
    container: "RegisteredDevice",
    key: uuidv4(),
    value: {
      customerId: customerId,
      batchCode: customer.deviceBatchCode,
      type: customer.deviceType === "myblu" ? "MyBlu" : customer.deviceType
    }
  });

module.exports = {
  authenticate,
  saveCustomer,
  saveCommunicationChannels,
  saveRegisteredDevice
};
