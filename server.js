const express = require('express');
const { Datastore } = require('@google-cloud/datastore');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

// Initialize Datastore client with your service account key
const datastore = new Datastore({
  projectId: 'your-project-id', // Replace with your project ID
  keyFilename: 'path-to-your-service-account-key.json', // Replace with the path to your service account key JSON file
});

// Replace the readCSVFile function with a function to retrieve data from Datastore
async function getDataFromDatastore() {
  try {
    const query = datastore.createQuery('ClientRecord');
    const [entities] = await datastore.runQuery(query);
    return entities;
  } catch (error) {
    throw new Error(`Error retrieving data from Datastore: ${error.message}`);
  }
}

// Replace the updateCSVFile function with a function to update data in Datastore
async function updateDataInDatastore(data) {
  try {
    await datastore.save(data);
  } catch (error) {
    throw new Error(`Error updating data in Datastore: ${error.message}`);
  }
}

// Replace '/api/getallclient' route to retrieve data from Datastore
app.get('/api/getallclient', async (req, res) => {
  try {
    const data = await getDataFromDatastore();
    res.json({ data: data });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving data from Datastore.' });
  }
});

// Replace '/api/create' route to create a new record in Datastore
app.post('/api/create', async (req, res) => {
  try {
    const { ClientCompanyName, LocationID, APIKey, CalendarLink, SpecialNotes, LiveTransferForm, BookedForm } = req.body;

    const existingRecordQuery = datastore
      .createQuery('ClientRecord')
      .filter('API key', '=', APIKey);

    const [existingRecords] = await datastore.runQuery(existingRecordQuery);

    if (existingRecords.length > 0) {
      return res.status(400).json({ error: 'API key already exists.' });
    }

    const newRecord = {
      key: datastore.key('ClientRecord'),
      data: {
        'Client Company Name': ClientCompanyName,
        'Location ID': LocationID,
        'API key': APIKey,
        'Calendar Link': CalendarLink,
        'Special Notes': SpecialNotes,
        'Live Transfer Form': LiveTransferForm,
        'Booked Form': BookedForm,
      },
    };

    await datastore.save(newRecord);
    res.json({ message: 'Record created successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating a new record in Datastore.' });
  }
});

// Replace '/api/update/:apiKey' route to update an existing record in Datastore
app.put('/api/update/:apiKey', async (req, res) => {
  try {
    const apiKey = req.params.apiKey;
    const {
      ClientCompanyName,
      LocationID,
      CalendarLink,
      SpecialNotes,
      LiveTransferForm,
      BookedForm,
    } = req.body;

    const existingRecordQuery = datastore
      .createQuery('ClientRecord')
      .filter('API key', '=', apiKey);

    const [existingRecords] = await datastore.runQuery(existingRecordQuery);

    if (existingRecords.length === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    const existingRecord = existingRecords[0];
    existingRecord.ClientCompanyName = ClientCompanyName;
    existingRecord.LocationID = LocationID;
    existingRecord['Calendar Link'] = CalendarLink;
    existingRecord['Special Notes'] = SpecialNotes;
    existingRecord['Live Transfer Form'] = LiveTransferForm;
    existingRecord['Booked Form'] = BookedForm;

    await datastore.save(existingRecord);
    res.json({ message: 'Record updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating the record in Datastore.' });
  }
});

// Replace '/api/delete/:apiKey' route to delete a record from Datastore
app.delete('/api/delete/:apiKey', async (req, res) => {
  try {
    const apiKey = req.params.apiKey;

    const existingRecordQuery = datastore
      .createQuery('ClientRecord')
      .filter('API key', '=', apiKey);

    const [existingRecords] = await datastore.runQuery(existingRecordQuery);

    if (existingRecords.length === 0) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    const existingRecordKey = existingRecords[0][datastore.KEY];
    await datastore.delete(existingRecordKey);
    res.json({ message: 'Record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting the record from Datastore.' });
  }
});

const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Start the server
const PORT = process.env.PORT || 8000;

app.use('/webhooks', endpoints);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});