const express = require('express');
const csvParser = require('csv-parser');
const endpoints = require('./webhooks/endpoints');
const cors = require('cors')
const fs = require('fs');
const app = express();

// Middleware to parse JSON request body
app.use(express.json());
app.use(cors());
// Helper function to read the CSV file and return the data as an array
async function readCSVFile() {
    const data = [];
    try {
        const csvFile = fs.createReadStream('existing-data.csv', 'utf8');
        await new Promise((resolve, reject) => {
            csvFile
                .pipe(csvParser({ headers: true, skipLines: 1 }))
                .on('data', (row) => {
                    data.push({
                        'Client Company Name': row['_0'],
                        'Location ID': row['_1'],
                        'API key': row['_2'],
                        'Calendar Link': row['_3'],
                        'Special Notes': row['_4'],
                        'Live Transfer Form': row['_5'],
                        'Booked Form': row['_6']
                    });
                })
                .on('end', () => {
                    console.log('CSV file successfully processed.');
                    resolve();
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
        return data;
    } catch (error) {
        throw new Error(`Error reading CSV file: ${error.message}`);
    }
}

// Helper function to update the CSV file with the modified data
function updateCSVFile(data) {
    const ws = fs.createWriteStream('existing-data.csv');
    ws.write('Client Company Name,Location ID,API,Calendar Link,Special Notes,Live Transfer Form,Appt Booked Form\n')
    data.forEach((record) => {
        ws.write(`${record['Client Company Name']},${record['Location ID']},${record['API key']},${record['Calendar Link']},${record['Special Notes']},${record['Live Transfer Form']},${record['Booked Form']}\n`);
    });
    ws.end();
}

// Create a new record in the CSV database
app.post('/api/create', async (req, res) => {
    const data = await readCSVFile();
    const { ClientCompanyName, LocationID, APIKey, CalendarLink, SpecialNotes, LiveTransferForm, BookedForm } = req.body;
    const existingRecord = data.find(record => record['API key'] === APIKey);
    if (existingRecord) {
        return res.status(400).json({ error: 'API key already exists.' });
    }
    data.push({
        'Client Company Name': ClientCompanyName,
        'Location ID': LocationID,
        'API key': APIKey,
        'Calendar Link': CalendarLink,
        'Special Notes': SpecialNotes,
        'Live Transfer Form': LiveTransferForm,
        'Booked Form': BookedForm
    });
    updateCSVFile(data);
    res.json({ message: 'Record created successfully.' });
});

// Update an existing record in the CSV database
app.put('/api/update/:apiKey', async (req, res) => {
    const data = await readCSVFile();
    const apiKey = req.params.apiKey;
    const { ClientCompanyName, LocationID, CalendarLink, SpecialNotes, LiveTransferForm, BookedForm } = req.body;

    // Find the index of the record with the specified API key
    const recordIndex = data.findIndex(record => record['API key'] === apiKey);
    if (recordIndex === -1) {
        return res.status(404).json({ error: 'Record not found.' });
    }

    // Update the record with the new values
    data[recordIndex]['Client Company Name'] = ClientCompanyName;
    data[recordIndex]['Location ID'] = LocationID;
    data[recordIndex]['Calendar Link'] = CalendarLink;
    data[recordIndex]['Special Notes'] = SpecialNotes;
    data[recordIndex]['Live Transfer Form'] = LiveTransferForm;
    data[recordIndex]['Booked Form'] = BookedForm;

    // Update the CSV file with the modified data
    updateCSVFile(data);

    res.json({ message: 'Record updated successfully.' });
});

// Delete a record from the CSV database
app.delete('/api/delete/:apiKey', async (req, res) => {
    const data = await readCSVFile();
    const apiKey = req.params.apiKey;
    var f;
    var found = data.some(function (record, index) { f = index; console.log(record['API key']); return record['API key'] === apiKey; });
    if (!found) {
        return res.status(404).json({ error: 'Record not found.' });
    }
    data.splice(f, 1);
    updateCSVFile(data);
    res.json({ message: 'Record deleted successfully.' });
});

const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});


// Start the server
const PORT = 3000;

app.use('/webhooks', endpoints);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
