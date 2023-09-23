const axios = require('axios');

async function processWebhook(req, res) {
    try {
        const data = req.body;

        if (!data) {
            return res.status(400).send('Missing data');
        }

        // Save data to a file
        // fs.writeFileSync('data.txt', JSON.stringify(data));

        const location_id = data?.location?.id;

        let exists = false;
        let api_key = false;
        let calendar_booking_link = '';
        let special_notes = '';
        let live_transfer_form = '';
        let appt_booked_form = '';

        // Replace this with the logic to load keys from a CSV file
        const keys = [];

        if (keys.length > 0) {
            keys.forEach((value) => {
                if (value[1] === location_id) {
                    exists = true;
                    api_key = value[2];
                    calendar_booking_link = value[3];
                    special_notes = value[4];
                    live_transfer_form = value[5];
                    appt_booked_form = value[6];
                }
            });
        }

        if (exists) {
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

            for (const [question, answer] of Object.entries(array)) {
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

            const email = array.email;
            const first_name = array.first_name;
            const last_name = array.last_name;
            const source = 'Facebook';
            const phone = array.phone;
            const campaign = array.contact_source;
            const contact_id = array.contact_id;
            const agent_name = `${array.user.firstName} ${array.user.lastName}`;
            const agent_phone = array.user.phone;

            const location_json = await getLocationDetails(location_id, api_key);
            const location_array = JSON.parse(location_json);

            const location_name = array.location.name;
            const location_username = `${location_array.locations[0].firstName} ${location_array.locations[0].lastName}`;
            const location_email = location_array.locations[0].email;
            const location_phone = location_array.locations[0].phone;

            // To do: Live transfer link
            // const live_transfer_link = `https://paragonapis.com/webhooks/lt.php?q=${contact_id}:${location_id}`.replace(/\s/g, '');
            const live_transfer_link = ''


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
            return res.status(400).send('Location ID not found in keys');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
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

// Express.js app setup
// const express = require('express');
// const app = express();
// app.use(express.json());

// Start the server
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
