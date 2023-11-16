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
            ghlAptBooked(req, res); // test
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
        case '/api/lt':
            lt(req, res);
            break;
        default:
            res.status(200).send('Server is working');
    }
});


//global function to extract locationid
const getEntity = async (res, locationId) => {

    console.log(locationId);
    const kind = 'Client'; // Specify your entity kind

    const query = datastore
        .createQuery(kind)
        .filter('LocationID', '=', locationId);

    try {
        const [entities] = await datastore.runQuery(query);
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
        const response = await axios.post('https://vanillasoft.net/web/post.aspx?id=132529&typ=XML', xmlPayload, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//function to add tag
async function addTagToContact(contactId, apiKey, tag) {
    const contactData = {
        tags: [tag]
    };

    try {
        const response = await axios.post(`https://rest.gohighlevel.com/v1/contacts/${contactId}/tags/`, contactData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data)
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
    const result = await getEntity(res, location_id);
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
    const result = await getEntity(res, location_id);
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
    const result = await getEntity(res, location_id);
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
        const result = await getEntity(res, locationId);
        const api_key = result[0]['APIKey'];


        if (api_key) {

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


        const location_id = data.customData.ghl_location_id;
        const result = await getEntity(res, location_id);
        const api_key = result[0]['APIKey'];


        if (api_key) {

            const email = data.customData.email;
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


        const location_id = data.customData.ghl_location_id;
        const result = await getEntity(res, location_id);
        const api_key = result[0]['APIKey'];


        if (api_key) {

            const email = data.customData.email;
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


        const location_id = data.customData.ghl_location_id;

        const result = await getEntity(res, location_id);
        console.log('result');
        const api_key = result[0]['APIKey'];


        if (api_key) {

            const email = data.customData.email;
            console.log(email)
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

            const customField = await axios.get(
                `https://rest.gohighlevel.com/v1/custom-fields/`,
                {
                    headers: {
                        Authorization: `Bearer ${api_key}`,
                    },
                }
            );

            const index = customField.data['customFields'].findIndex(x => x['name'] === 'ISA Call Notes')
            const field_id = customField.data['customFields'][index]['id']

            const note_arr = {
                customField: {

                }
            }

            note_arr.customField[field_id] = comment
            console.log(note_arr)

            const update = await axios.put(
                `https://rest.gohighlevel.com/v1/contacts/${contact_id}/`,
                note_arr,
                {
                    headers: {
                        Authorization: `Bearer ${api_key}`,
                    },
                }
            );

            const response = await createContactNote(contact_id, contact_json, api_key);
            console.log(update.data)
            res.sendStatus(200);
        } else {
            console.log(`API key not found for location: ${location_id}`);
            res.status(404).send(`API key not found for location: ${location_id}`);
        }
    } catch (error) {
        res.status(500).send(error);
    }
}

//Case 8 - 'no answer'
const noAnswer = async (req, res) => {
    console.log(req.body);
    const contact_id = req.body.contact.ghl_contact_id;
    const location_id = req.body.contact.ghl_location_id;
    const result = await getEntity(res, location_id);
    const api_key = result[0]['APIKey'];

    try {
        if (api_key) {
            console.log(api_key)
            const contact_arr = { body: 'ISA Notes: VM/NO Answer' };
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

//Case 9 - 'leads in'
const ghltoVanillasoft = async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            return res.status(400).send('Missing data');
        }


        const location_id = data['location']['id'];

        const result = await getEntity(res, location_id);
        console.log('result');
        const api_key = result[0]['APIKey'];
        const calendar_booking_link = result[0]['CalendarLink'];
        constspecial_notes = result[0]['SpecialNotes'];
        const live_transfer_form = '';
        const appt_booked_form = '';

        if (api_key) {

            let military_branch = '';
            let location = '';
            let rent_or_own = '';
            let yearly_income;
            let est_credit_score;
            let employment_status;
            let timeline = '';
            let loan_amount;
            let down_payment;
            let re_agent = '';
            let purchase_refinance;
            let own_a_home;
            let zipcode;
            let type_of_property;
            let year_purchased;
            let using_this;
            let property_worth;
            let mortgage_owe;
            let purpose;
            let cash_out_amount;
            let interest_rate;
            let disability_discharged;

            for (const [question, answer] of Object.entries(data)) {
                if (
                    question.includes('Location') ||
                    question.includes('--PR 2.') ||
                    question.includes('Combo 4.1')
                ) {
                    if (answer) {
                        location = answer;
                    }
                } else if (
                    question.includes('Rent or Own') ||
                    question.includes('FTHB 1.')
                ) {
                    if (answer) {
                        rent_or_own = answer;
                    }
                } else if (
                    question.includes('Yearly Income') ||
                    question.includes('RF 15.') ||
                    question.includes('V2 - 16.')
                ) {
                    yearly_income = answer;
                } else if (
                    question.includes('Estimated Credit Score') ||
                    question.includes('Credit Score') ||
                    question.includes('PR. What') ||
                    question.includes('RF 13. What') ||
                    question.includes('V2 - 13.')
                ) {
                    est_credit_score = answer;
                } else if (
                    question.includes('Employment Status') ||
                    question.includes('V2 - 14. What')
                ) {
                    employment_status = answer;
                } else if (
                    question.includes('Timeline') ||
                    question.includes('RF 12. When are you planning') ||
                    question.includes('V2 - 12.') ||
                    question.includes('RF 12. VA') ||
                    question.includes('RF 12. TCH') ||
                    question.includes('RF 12. HC') ||
                    question.includes('RF 12. FTHB') ||
                    question.includes('RF 12. FR') ||
                    question.includes('Combo 3. HC') ||
                    question.includes('Combo 3. FR') ||
                    question.includes('Combo 3. HC') ||
                    question.includes('Combo 3. TCH') ||
                    question.includes('Combo 3. VA')
                ) {
                    if (answer) {
                        timeline = answer;
                    }
                } else if (
                    question.includes('Loan Amount') ||
                    question.includes('PR 3.')
                ) {
                    loan_amount = answer;
                } else if (
                    question.includes('Down Payment') ||
                    question.includes('PR 5. What Is Your Estimated Down')
                ) {
                    down_payment = answer;
                } else if (
                    question.includes('RE Agent') ||
                    question.includes('Purchase 4. TCH')
                ) {
                    if (answer) {
                        re_agent = answer;
                    }
                } else if (
                    question.includes('Purchase/Refinance') ||
                    question.includes('PR 1. Are')
                ) {
                    purchase_refinance = answer;
                } else if (
                    question.includes('Own A Home') ||
                    question.includes('RF 1. Do you currently own a home')
                ) {
                    own_a_home = answer;
                } else if (
                    question.includes('Zip Code') ||
                    question.includes('RF 3. What is your home')
                ) {
                    zipcode = answer;
                } else if (
                    question.includes('Type of Property') ||
                    question.includes('RF 4.')
                ) {
                    type_of_property = answer;
                } else if (
                    question.includes('Year Purchased') ||
                    question.includes('RF 5. When was your property purchased')
                ) {
                    year_purchased = answer;
                } else if (
                    question.includes('Using This Home') ||
                    question.includes('RF 6. How are you using this home')
                ) {
                    using_this = answer;
                } else if (
                    question.includes('Property Worth') ||
                    question.includes('RF 7. How')
                ) {
                    property_worth = answer;
                } else if (
                    question.includes('Mortgage Owe') ||
                    question.includes('RF 8.')
                ) {
                    mortgage_owe = answer;
                } else if (
                    question.includes('Purpose') ||
                    question.includes('what is your')
                ) {
                    purpose = answer;
                } else if (
                    question.includes('Cash Out Amount') ||
                    question.includes('RF 10. How') ||
                    question.includes('RF 9. Are you looking to take cash out for debt consolidation')
                ) {
                    cash_out_amount = answer;
                } else if (
                    question.includes('Interest Rate') ||
                    question.includes('RF 11.')
                ) {
                    interest_rate = answer;
                } else if (
                    question.includes('Military Branch') ||
                    question.includes('RF 2.0 VA')
                ) {
                    if (answer) {
                        military_branch = answer;
                    }
                } else if (
                    question.includes('Disability Discharged') ||
                    question.includes('PR 8. VA')
                ) {
                    disability_discharged = answer;
                }
            }

            const email = data.email;
            const first_name = data.first_name;
            const last_name = data.last_name;
            const source = 'Facebook';
            const phone = data.phone;
            const campaign = data.contact_source;
            const contact_id = data.contact_id;
            const agent_name = `${data.user.firstName} ${data.user.lastName}`;
            const agent_phone = data.user.phone;

            const location_json = await getLocationDetails(location_id, api_key);
            const location_array = JSON.parse(location_json);

            const location_name = data.location.name;
            const location_username = `${location_array.locations[0].firstName} ${location_array.locations[0].lastName}`;
            const location_email = location_array.locations[0].email;
            const location_phone = location_array.locations[0].phone;

            const live_transfer_link = `https://us-central1-vanillasoft-to-ghl.cloudfunctions.net/function-3/api/lt?data=${contact_id}:${location_id}`.replace(/\s/g, '')


            const xml = `<Lead>
                          <Email>${email}</Email>
                          <FirstName>${first_name}</FirstName>
                          <LastName>${last_name}</LastName>
                          <Mobile>${phone}</Mobile>
                          <LeadSourceName>${source}</LeadSourceName>
                          <Campaign>${campaign}</Campaign>
                          <GhlLocationID>${location_id}</GhlLocationID>
                          <GhlClientID>${contact_id}</GhlClientID>
                          <SpecialInternalNotesForAgents>${special_notes}</SpecialInternalNotesForAgents>
                          <Location>${location}</Location>
                          <RentOrOwn>${rent_or_own}</RentOrOwn>
                          <YearlyIncome>${yearly_income}</YearlyIncome>
                          <EstimatedCreditScore>${est_credit_score}</EstimatedCreditScore>
                          <EmploymentStatus>${employment_status}</EmploymentStatus>
                          <Timeline>${timeline}</Timeline>
                          <LoanAmount>${loan_amount}</LoanAmount>
                          <DownPayment>${down_payment}</DownPayment>
                          <ReAgent>${re_agent}</ReAgent>
                          <PurchaseRefinance>${purchase_refinance}</PurchaseRefinance>
                          <OwnAHome>${own_a_home}</OwnAHome>
                          <ZipCode>${zipcode}</ZipCode>
                          <ZipCodeT>${zipcode}</ZipCodeT>
                          <TypeOfProperty>${type_of_property}</TypeOfProperty>
                          <YearPurchased>${year_purchased}</YearPurchased>
                          <UsingThisHome>${using_this}</UsingThisHome>
                          <PropertyWorth>${property_worth}</PropertyWorth>
                          <MortgageOwe>${mortgage_owe}</MortgageOwe>
                          <Purpose>${purpose}</Purpose>
                          <CashOutAmount>${cash_out_amount}</CashOutAmount>
                          <InterestRate>${interest_rate}</InterestRate>
                          <MilitaryBranch>${military_branch}</MilitaryBranch>
                          <LosEmail>${location_email}</LosEmail>
                          <LosPhone>${location_phone}</LosPhone>
                          <LosName>${location_username}</LosName>
                          <LosCompany>${location_name}</LosCompany>
                          <BookingLink>${calendar_booking_link}</BookingLink>
                          <LiveTransferForm>${live_transfer_form}</LiveTransferForm>
                          <ApptBookedForm>${appt_booked_form}</ApptBookedForm>
                          <Link>${live_transfer_link}</Link>
                          <DisabilityDischarged>${disability_discharged}</DisabilityDischarged>
                          <AssignedAgent>${agent_name}</AssignedAgent>
                          <AssignedAgentPhone>${agent_phone}</AssignedAgentPhone>
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

const lt = async (req, res) => {
    const query = req.query.data.split(':')

    const contact_id = query[0];
    const location_id = query[1];
    const result = await getEntity(res, location_id);
    const api_key = result[0]['APIKey'];

    try {
        if (api_key) {
            console.log(api_key)
            const contact_arr = { body: 'Live Transfer Coming' };
            const contact_json = JSON.stringify(contact_arr);
            console.log(contact_json)


            const response = await createContactNote(contact_id, contact_json, api_key);
            const tagResponse = await addTagToContact(contact_id, api_key, 'live transfer in 90 seconds')
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