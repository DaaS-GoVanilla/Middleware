const express = require('express');
const csvParser = require('csv-parser');
const endpoints = require('./webhooks/endpoints');
const fs = require('fs');
const app = express();

// Middleware to parse JSON request body
app.use(express.json());

// Helper function to read the CSV file and return the data as an array
function readCSVFile() {
    const data = [];
    try {
        const csvFile = fs.readFileSync('existing-data.csv', 'utf8');
        csvParser(csvFile, { headers: true })
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                console.log('CSV file successfully processed.');
            });
    } catch (error) {
        console.error('Error reading CSV file:', error.message);
    }
    return data;
}

// Helper function to update the CSV file with the modified data
function updateCSVFile(data) {
    const ws = fs.createWriteStream('existing-data.csv');
    data.forEach((record) => {
        ws.write(`${record['Client Company Name']},${record['Location ID']},${record['API key']},${record['Calendar Link']},${record['Special Notes']},${record['Live Transfer Form']},${record['Booked Form']}\n`);
    });
    ws.end();
}

// Create a new record in the CSV database
app.post('/api/create', (req, res) => {
    const data = readCSVFile();
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
app.put('/api/update/:apiKey', (req, res) => {
    const data = readCSVFile();
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
app.delete('/api/delete/:apiKey', (req, res) => {
    const data = readCSVFile();
    const apiKey = req.params.apiKey;
    const recordIndex = data.findIndex(record => record['API key'] === apiKey);
    if (recordIndex === -1) {
        return res.status(404).json({ error: 'Record not found.' });
    }
    data.splice(recordIndex, 1);
    updateCSVFile(data);
    res.json({ message: 'Record deleted successfully.' });
});

// Start the server
const PORT = 3000;

app.use('/webhooks', endpoints);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
