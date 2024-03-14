const functions = require('@google-cloud/functions-framework');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Datastore } = require('@google-cloud/datastore');
const axios = require('axios')


const secretManagerServiceClient = new SecretManagerServiceClient();
const name = 'projects/644933129552/secrets/userLogin/versions/1';

const datastore = new Datastore();

secretManager = async () => {
    const [version] = await secretManagerServiceClient.accessSecretVersion({ name });
    const payload = version.payload.data.toString();
    console.debug(`Payload: ${payload}`);
    return payload;
};

functions.http('middleware', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "DELETE, POST, PUT, GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    const method = req.method;
    const entityId = req.query.id;
    const path = req.path;

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', "DELETE, POST, PUT, GET, OPTIONS");
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    }

    if (path === "/middleware/login") {
        const body = req.body;
        const secretkey = await secretManager();
        if (body['username'] === 'user' && body['password'] === secretkey) {
            res.status(200).send('Secret key matched');
        } else {
            res.status(404).send('User not found');
        }
    } else if (path === "/middleware/pause") {
        const action = req.body.action;
        const apiKey = req.body.APIKey

        try {
            if (action === 'Pause') {
                await pause(apiKey);
            } else {
                await unpause(apiKey);
            }
            const kind = 'Client';
            const key = datastore.key([kind, apiKey]);
            const [entity] = await datastore.get(key);
            await datastore.save({
                key: key,
                data: {
                    APIKey: apiKey,
                    CalendarLink: entity['CalendarLink'],
                    ClientCompanyName: entity['ClientCompanyName'],
                    LocationID: entity['LocationID'],
                    SpecialNotes: entity['SpecialNotes'],
                    Active: action === 'Pause' ? 'False' : 'True'
                }
            });

            res.status(200).send('Action completed successfully');
        } catch (error) {
            console.log(error)
            res.status(500).send('Error occurred');
        }

    } else if (method === 'POST') {
        // Create Entity
        const entityData = req.body;
        const kind = 'Client';
        const id = entityData['APIKey']

        const entity = {
            key: datastore.key([kind, id]),
            data: entityData,
        };

        await datastore.save(entity);
        res.status(200).send('Entity created successfully');
    } else if (method === 'GET') {
        // Read Entity
        const kind = 'Client';
        const query = datastore.createQuery(kind)

        const [entity] = await datastore.runQuery(query);
        if (entity) {
            res.status(200).json(entity);
        } else {
            res.status(404).send('Entity not found');
        }
    } else if (method === 'PUT') {
        // Update Entity
        const kind = 'Client';
        const entityData = req.body;

        const key = datastore.key([kind, entityId]);

        const [entity] = await datastore.get(key);
        if (entity) {
            entityData.key = key;
            await datastore.save({ key: key, data: entityData });
            res.status(200).send('Entity updated successfully');
        } else {
            res.status(404).send('Entity not found');
        }
    } else if (method === 'DELETE') {
        // Delete Entity
        const kind = 'Client';
        const key = datastore.key([kind, entityId]);

        const [entity] = await datastore.get(key);
        if (entity) {
            await datastore.delete(key);
            res.status(200).send('Entity deleted successfully');
        } else {
            res.status(404).send('Entity not found');
        }
    } else {
        res.status(405).send('Method not allowed');
    }
});

async function fetchPausedContacts(url, api_key, count, contact, stageObject) {
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
        if (pipelineStageId === stageObject['Leads In'] || pipelineStageId === stageObject['Add to ISA Queue'] || pipelineStageId === stageObject['No Show']) {
            const email = opportunity.contact.email;
            contact.push(email);
        }
    });

    if (count < totalMeta) {
        return await fetchPausedContacts(nextPageUrl, api_key, count, contact, stageObject);
    } else {
        return contact;
    }
}

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
        console.log(JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function pause(apiKey) {
    try {
        const api_key = apiKey;
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
        console.log(error);
        throw error;
    }
}

async function unpause(apiKey) {
    try {

        const api_key = apiKey;
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


        contact = await fetchPausedContacts(`https://rest.gohighlevel.com/v1/pipelines/${masterPipeline.id}/opportunities`, api_key, 0, [], stageObject);
        console.log(contact)

        for (let index = 0; index < contact.length; index++) {
            const email = contact[index];
            if (email) {
                console.log(email)
                const xml = `<Lead>
                            <Email>${email}</Email>
                            <CallFlag>True</CallFlag>
                            </Lead>`;

                await createLeadVS(xml);
            }
        }

    } catch (error) {
        console.log(error);
        throw error;
    }
}