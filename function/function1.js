const functions = require('@google-cloud/functions-framework');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Datastore } = require('@google-cloud/datastore');

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
        const body = req.body;

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
