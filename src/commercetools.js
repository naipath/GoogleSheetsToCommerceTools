const { URLSearchParams } = require("url");
const fetch = require("node-fetch");
const uuidv4 = require("uuid/v4");

const handle = errorMessage => async res => {
  const message = await res.json();
  if (res.ok) return message;
  throw new Error(
    `${errorMessage}: ${res.status}\n${JSON.stringify(message, null, 2)}`
  );
};

class CommerceToolsClient {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.hostUrl = config.hostUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.projectKey = config.projectKey;
    this.projectScope = config.projectScope;
  }

  async init() {
    const params = new URLSearchParams();
    params.append("grant_type", `client_credentials`);
    params.append("scope", `${this.projectScope}:${this.projectKey}`);

    const result = await fetch(`${this.hostUrl}/oauth/token`, {
      method: "POST",
      body: params,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${this.clientId}:${this.clientSecret}`
        ).toString("base64")}`
      }
    }).then(handle("Commercetools authentication failed"));

    this.token = result["access_token"];
  }

  async _apiCall(url, body) {
    return fetch(`${this.apiUrl}/${this.projectKey}${url}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }

  async saveCustomer(customer) {
    return this._apiCall("/customers", {
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
    }).then(handle("Saving the customer failed"));
  }

  async saveRegisteredDevice(customer, customerId) {
    return this._apiCall("/custom-objects", {
      container: "RegisteredDevice",
      key: uuidv4(),
      value: {
        customerId: customerId,
        batchCode: customer.deviceBatchCode,
        type: customer.deviceType === "myblu" ? "MyBlu" : customer.deviceType
      }
    }).then(handle(`Saving the registered devices failed`));
  }

  async saveCommunicationChannels(customer, customerId) {
    const agreed = customer.agreeNewsletter === "True";
    return this._apiCall("/custom-objects", {
      container: "communicationChannels",
      key: customerId,
      value: {
        directMail: agreed,
        textMessage: agreed,
        phone: agreed,
        email: agreed
      }
    }).then(handle(`Saving the communication channels failed`));
  }
}

module.exports = CommerceToolsClient;
