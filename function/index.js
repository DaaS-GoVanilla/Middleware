const functions = require('@google-cloud/functions-framework');
const { Datastore } = require('@google-cloud/datastore');
const axios = require('axios')

const datastore = new Datastore();

functions.http('api', async (req, res) => {
    const path = req.path;

    switch (path) {
        case '/api/baddata':
            badData(req, res);
            break;
        case '/api/bookingmade':
            bookingMade(req, res);
            break;
        case '/api/callback':
            callBack(req, res);
            break;
        case '/api/ghlappointmentbooked':
            ghlAptBooked(req, res);
            break;
        case '/api/ghlloconversation':
            ghlLoConversion(req, res);
            break;
        case '/api/ghlnoshow':
            ghlNoShow(req, res);
            break;
        case '/api/ghlprospectreplied':
            ghlProspectReplied(req, res);
            break;
        case '/api/ghltovanillasoft':
            ghltoVanillasoft(req, res);
            break;
        case '/api/livetransfer':
            liveTransfer(req, res);
            break;
        case '/api/noanswer':
            noAnswer(req, res);
            break;

        default:
            res.status(200).send('Server is working');
    }
});


//global function to extract locationid
const getEntity = async (locationId) => {
    // Assuming location_id is passed as a query parameter

    const kind = 'Client'; // Specify your entity kind

    const query = datastore
        .createQuery(kind)
        .filter('LocationID', '=', locationId);

    try {
        const [entities] = await datastore.runQuery(query);
        console.log(entities);
        return entities;
    } catch (error) {
        console.error('Error querying entities:', error);
        res.status(500).send('Error querying entities');
    }
};
//global function to extract getLocationUsers

async function getLocationDetails(location_id, api_key) {
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

//global function to extract createContactNote
async function createContactNote(contact_id, contact_json, api_key) {
    console.log(contact_json)
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

//function to create Lead

async function createLeadVS(xmlPayload) {
    try {
        const response = await axios.post('https://vanillasoft.net/web/post.aspx?id=109426&typ=XML', xmlPayload, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//Case 1 - 'baddata'
const badData = async (req, res) => {
    console.log(req.body);
    const contact_id = req.body.contact.ghl_contact_id;
    const location_id = req.body.contact.ghl_location_id;
    const result = await getEntity(location_id);
    const api_key = result[0]['APIKey'];

    try {
        if (api_key) {
            console.log(api_key)
            const contact_arr = { body: 'BAD DATA - Bad Data (DNC)' };
            const contact_json = JSON.stringify(contact_arr);
            console.log(contact_json)


            const response = await createContactNote(contact_id, contact_json, api_key);
            console.log(response);
            res.sendStatus(200);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            res.status(404).send(`API key not found for location: ${location_id}`);
        }
    } catch (error) {
        res.status(500).send(error);
    }
}
//Case 2 - 'bookingMade'
const bookingMade = async (req, res) => {

    const contact_id = req.body.contact.ghl_contact_id;
    const location_id = req.body.contact.ghl_location_id;
    const result = await getEntity(location_id);
    const api_key = result[0]['APIKey'];

    try {
        if (api_key) {
            console.log(api_key)
            const contact_arr = { body: 'BOOK APPT - Booking Made' };
            const contact_json = JSON.stringify(contact_arr);
            console.log(contact_json)


            const response = await createContactNote(contact_id, contact_json, api_key);
            console.log(response);
            res.sendStatus(200);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            res.status(404).send(`API key not found for location: ${location_id}`);
        }
    } catch (error) {
        res.status(500).send(error);
    }
}

//Case 3 - 'callback'
const callBack = async (req, res) => {

    const contact_id = req.body.contact.ghl_contact_id;
    const location_id = req.body.contact.ghl_location_id;
    const result = await getEntity(location_id);
    const api_key = result[0]['APIKey'];

    try {
        if (api_key) {
            console.log(api_key)
            const contact_arr = { body: 'CALLBACK - Callback later' };
            const contact_json = JSON.stringify(contact_arr);
            console.log(contact_json)


            const response = await createContactNote(contact_id, contact_json, api_key);
            console.log(response);
            res.sendStatus(200);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            res.status(404).send(`API key not found for location: ${location_id}`);
        }
    } catch (error) {
        res.status(500).send(error);
    }
}

//Case 4 - 'ghl_appointment_booked'
const ghlAptBooked = async (req, res) => {

    try {
        const data = req.body;

        if (!data) {
            return res.status(400).send('Missing data');
        }


        const locationId = data.contact.ghl_location_id;
        const result = await getEntity(locationId);
        const api_key = result[0]['APIKey'];


        if (api_key) {

            const locationDetails = await getLocationDetails(location_id, api_key);
            const timeline = locationDetails.timeline;
            const re_agent = locationDetails.re_agent;
            const calendar_booking_link = locationDetails.calendar_booking_link;
            const special_notes = locationDetails.special_notes;

            const email = data.email;
            const xml = `<Lead>
            <Email>${email}</Email>
            <CallFlag>False</CallFlag>
            <Timeline>${timeline}</Timeline>
            <ReAgent>${re_agent}</ReAgent>
            <CalendarBookingLink>${calendar_booking_link}</CalendarBookingLink>
            <SpecialNotes>${special_notes}</SpecialNotes>
          </Lead>`;

            await createLeadVS(xml);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            return res.status(400).send('API key not found for location');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }

}

//Case 5 - 'ghl lo conversation'
const ghlLoConversion = async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            return res.status(400).send('Missing data');
        }


        const location_id = data.contact.ghl_location_id;
        const result = await getEntity(location_id);
        const api_key = result[0]['APIKey'];


        if (api_key) {

            const locationDetails = await getLocationDetails(location_id, api_key);
            const timeline = locationDetails.timeline;
            const re_agent = locationDetails.re_agent;
            const calendar_booking_link = locationDetails.calendar_booking_link;
            const special_notes = locationDetails.special_notes;

            const email = data.email;
            const xml = `<Lead>
                    <Email>${email}</Email>
                    <CallFlag>False</CallFlag>
                    </Lead>`;

            await createLeadVS(xml);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            return res.status(400).send('API key not found for location');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
}

//Case 6 - 'ghl no show'
const ghlNoShow = async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            return res.status(400).send('Missing data');
        }


        const location_id = data.contact.ghl_location_id;
        const result = await getEntity(location_id);
        const api_key = result[0]['APIKey'];


        if (api_key) {

            const locationDetails = await getLocationDetails(location_id, api_key);
            const timeline = locationDetails.timeline;
            const re_agent = locationDetails.re_agent;
            const calendar_booking_link = locationDetails.calendar_booking_link;
            const special_notes = locationDetails.special_notes;

            const email = data.email;
            const xml = `<Lead>
                    <Email>${email}</Email>
                    <CallFlag>True</CallFlag>
                    </Lead>`;

            await createLeadVS(xml);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            return res.status(400).send('API key not found for location');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
}

//Case 7 - 'ghl prospect replied'
const ghlProspectReplied = async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            return res.status(400).send('Missing data');
        }


        const location_id = data.contact.ghl_location_id;
        const result = await getEntity(location_id);
        const api_key = result[0]['APIKey'];


        if (api_key) {

            const locationDetails = await getLocationDetails(location_id, api_key);
            const timeline = locationDetails.timeline;
            const re_agent = locationDetails.re_agent;
            const calendar_booking_link = locationDetails.calendar_booking_link;
            const special_notes = locationDetails.special_notes;

            const email = data.email;
            const xml = `<Lead>
                    <Email>${email}</Email>
                    <CallFlag>False</CallFlag>
                    </Lead>`;

            await createLeadVS(xml);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            return res.status(400).send('API key not found for location');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
}

//Case 8 - 'live transfer'
const liveTransfer = async (req, res) => {

    const contact_id = req.body.contact.ghl_contact_id;
    const location_id = req.body.contact.ghl_location_id;
    const comment = req.body.contact.comment
    const result = await getEntity(location_id);
    const api_key = result[0]['APIKey'];

    try {
        if (api_key) {
            console.log(api_key)
            const contact_arr = { body: 'LIVE TRANS - Live Transfer' };
            const contact_json = JSON.stringify(contact_arr);
            console.log(contact_json)

            const customField = await axios.get(
                `https://rest.gohighlevel.com/v1/custom-fields`,
                {
                    headers: {
                        Authorization: `Bearer ${api_key}`,
                    },
                }
            );

            const index = customField.data['customFields'].findIndex(x => x['name'] === 'ISA Call Notes')
            const field_id = customField.data['customFields'][index]

            const note_arr = {
                body: {

                }
            }

            field_id.body[field_id] = comment

            const note_json = JSON.stringify(note_arr)

            await axios.put(
                `https://rest.gohighlevel.com/v1/contacts/${contact_id}`,
                note_json,
                {
                    headers: {
                        Authorization: `Bearer ${api_key}`,
                    },
                }
            );

            const response = await createContactNote(contact_id, contact_json, api_key);
            console.log(response);

            res.sendStatus(200);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            res.status(404).send(`API key not found for location: ${location_id}`);
        }
    } catch (error) {
        res.status(500).send(error);
    }
}