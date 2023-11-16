const axios = require('axios')

async function test() {
    try {

        const api_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImV1SFlyN2t6SHlYUk9qWjF4SXlKIiwiY29tcGFueV9pZCI6Ik5yeFhrQ1U2d0psWG04RGw1Y2VLIiwidmVyc2lvbiI6MSwiaWF0IjoxNjU0ODEyMjUzNDQ4LCJzdWIiOiIxcUNnYjN1a3BYRnlSTjBWajluVCJ9.lyiLflISk8CHP7tqk4vhKowJy1Fq03SQm-00m0NE5Pc'
        const contact_id = 'NJuMx93F1Kv9g1YvMxh3'
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

        note_arr.customField[field_id] = 'hey'
        const note_json = JSON.stringify(note_arr)
        console.log(note_json)
        const update = await axios.put(
            `https://rest.gohighlevel.com/v1/contacts/${contact_id}/`,
            note_arr,
            {
                headers: {
                    Authorization: `Bearer ${api_key}`,
                },
            }
        );
        console.log(update.data.contact.customField)
    } catch (error) {
        console.log(error)
    }
}

test()