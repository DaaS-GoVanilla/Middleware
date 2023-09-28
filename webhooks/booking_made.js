const axios = require('axios');

async function bookingMade(req, res) {
  try {
    const data = req.body;

    if (!data) {
      return res.status(400).send('Missing data');
    }

    const dataArray = JSON.parse(data);
    const contact_id = dataArray.contact.ghl_contact_id;
    const location_id = dataArray.contact.ghl_location_id;

    //To Do: Replace this with the logic to load keys from a CSV file
    const keys = [];

    let exists = false;
    let api_key = false;


    if (keys.length > 0) {
      keys.forEach((value) => {
        if (value[1] === location_id) {
          exists = true;
          api_key = value[2];
        }
      });
    }

    if (exists) {
      const users_json = await getLocationUsers(location_id, api_key);
      const users = JSON.parse(users_json);
      const user_id = users.users[0].id;

      const contact_arr = { body: 'BOOK APPT - Booking Made' };
      const contact_json = JSON.stringify(contact_arr);

      const result = await createContactNote(contact_id, contact_json, api_key);
      console.log(result);
    }
  } catch (error) {
    console.error(error.message);
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