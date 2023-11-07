const axios = require('axios');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

async function badData(req, res) {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).send('Missing data');
    }

    const dataArray = JSON.parse(data);
    const contact_id = dataArray.contact.ghl_contact_id;
    const location_id = dataArray.contact.ghl_location_id;

    const api_key = await getApiKeyFromGCP(location_id);

    if (api_key) {
      const users_json = await getLocationUsers(location_id, api_key);
      const users = JSON.parse(users_json);
      const user_id = users.users[0].id;

      const contact_arr = { body: 'BAD DATA - Bad Data (DNC)' };
      const contact_json = JSON.stringify(contact_arr);

      const result = await createContactNote(contact_id, contact_json, api_key);
      console.log(result);
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function getApiKeyFromGCP(location_id) {
  const secretClient = new SecretManagerServiceClient();
  const secretName = `projects/your-project-id/secrets/api-key-secrets/versions/latest`; // Replace with your project and secret details

  try {
    const [version] = await secretClient.accessSecretVersion({ name: secretName });
    return version.payload.data.toString('utf8');
  } catch (error) {
    console.error(`Error getting API key from GCP Secret Manager: ${error.message}`);
    return null;
  }
}

async function getLocationUsers(location_id, api_key) {
  try {
    const response = await axios.get(
      `https://rest.gohighlevel.com/v1/users/?locationId=${location_id}`,
      {
        headers: {
          Authorization: `Bearer ${api_key}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error getting location users: ${error.message}`);
  }
}

async function createContactNote(contact_id, contact_json, api_key) {
  try {
    const response = await axios.post(
      `https://rest.gohighlevel.com/v1/contacts/${contact_id}/notes/`,
      contact_json,
      {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error creating contact note: ${error.message}`);
  }
}

module.exports = badData