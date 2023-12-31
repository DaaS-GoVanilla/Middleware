const axios = require('axios');

async function ghlAptBooked(req, res) {
    try {
        const data = req.body;

        if (!data) {
            return res.status(400).send('Missing data');
        }
        const location_id = data?.location?.id;

        //To Do: Replace this with the logic to load keys from a CSV file
        const keys = [];

        let timeline = '';
        let re_agent = '';
        let exists = false;
        let api_key = false;
        let calendar_booking_link = '';
        let special_notes = '';


        if (keys.length > 0) {
            keys.forEach((value) => {
                if (value[1] === location_id) {
                    exists = true;
                    api_key = value[2];
                    calendar_booking_link = value[3];
                    special_notes = value[4];
                }
            });
        }

        if (exists) {
            const email = data.email;
            const booking_status = data['calendar']['status'];

            if (booking_status == 'booked') {
                const xml = `<Lead>
                    <Email>${email}</Email>
                    <CallFlag>False</CallFlag>
                    <LeadStatus>Booked Appointment</LeadStatus>
                    </Lead>`;

                await createLeadVS(xml);
            }
        }
        else {
            return res.status(400).send('Location ID not found in keys');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
}

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
async function getLocationDetails(location_id, api_key) {
    try {
        const response = await axios.get(`https://rest.gohighlevel.com/v1/locations/${location_id}`, {
            headers: {
                'Authorization': `Bearer ${api_key}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = ghlAptBooked