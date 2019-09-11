const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

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

module.exports = {
  authenticate,
  saveCustomer
};

// TODO: Map these fields
//     deviceType: 'myblu',
//     deviceBatchCode: 'B1234',
//     agreeNewsletter: 'True',
