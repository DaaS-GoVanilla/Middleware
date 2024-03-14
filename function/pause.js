const axios = require('axios')

async function fetchPipelineContacts(url, api_key, count, contact) {
    const response = await axios.get(
        url,
        {
            headers: {
                Authorization: `Bearer ${api_key}`,
            },
        }
    );
    const opportunities = response.data.opportunities;
    const nextPageUrl = response.data.meta.nextPageUrl;
    const totalMeta = response.data.meta.total;

    // Process opportunities (e.g., extract pipelineStageId and email)
    opportunities.forEach(opportunity => {
        count = count + 1;
        const pipelineStageId = opportunity.pipelineStageId;
        const email = opportunity.contact.email;
        contact.push(email);
    });

    if (count < totalMeta) {
        return await fetchPipelineContacts(nextPageUrl, api_key, count, contact);
    } else {
        return contact;
    }
}

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

async function test() {
    try {
        const api_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6ImV1SFlyN2t6SHlYUk9qWjF4SXlKIiwiY29tcGFueV9pZCI6Ik5yeFhrQ1U2d0psWG04RGw1Y2VLIiwidmVyc2lvbiI6MSwiaWF0IjoxNjU0ODEyMjUzNDQ4LCJzdWIiOiIxcUNnYjN1a3BYRnlSTjBWajluVCJ9.lyiLflISk8CHP7tqk4vhKowJy1Fq03SQm-00m0NE5Pc'
        const response = await axios.get(
            `https://rest.gohighlevel.com/v1/pipelines`,
            {
                headers: {
                    Authorization: `Bearer ${api_key}`,
                },
            }
        );

        // Find the Master Pipeline
        const masterPipeline = response.data.pipelines.find(pipeline => pipeline.name === "1. Master Pipeline");

        // Create an object with stage name as key and stage id as value
        const stageObject = masterPipeline.stages.reduce((acc, stage) => {
            acc[stage.name] = stage.id;
            return acc;
        }, {});


        contact = await fetchPipelineContacts(`https://rest.gohighlevel.com/v1/pipelines/${masterPipeline.id}/opportunities`, api_key, 0, []);
        console.log(contact)

        for (let index = 0; index < contact.length; index++) {
            const email = contact[index];
            if (email) {
                console.log(email)
                const xml = `<Lead>
                            <Email>${email}</Email>
                            <CallFlag>False</CallFlag>
                            </Lead>`;

                await createLeadVS(xml);
            }
        }

    } catch (error) {
        console.log(error)
    }
}

test()