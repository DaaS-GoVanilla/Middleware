const axios = require('axios')

async function test() {
    const customField = await axios.get(
        `https://rest.gohighlevel.com/v1/custom-fields/`,
        {
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6IjdxUllmUGtnZ0NGbXZrandGSVE5IiwiY29tcGFueV9pZCI6Ik5yeFhrQ1U2d0psWG04RGw1Y2VLIiwidmVyc2lvbiI6MSwiaWF0IjoxNjg3MzYxOTA5NzczLCJzdWIiOiJrQmY3bWhXMFlXZzROZXhuOTM0aiJ9.bf6QnUperGS8R4_NzI1hZ-Px_YsB09Fb8rgvG11_w14`,
            },
        }
    );
    const index = customField.data['customFields'].findIndex(x => x['name'] === 'ISA Call Notes')
    console.log(customField.data['customFields'][index])
}

test()