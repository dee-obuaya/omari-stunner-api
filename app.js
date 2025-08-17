const express = require('express');
const mongoose = require('mongoose');
const Service = require('./models/service');
const Tab = require('./models/tab');

mongoose.connect('mongodb://localhost:27017/omari-stunner-dev');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected successfully');
});

const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.send('Hello from Omari Stunner!');
});

app.get('/services', async (req, res) => {
    const services = await Service.find({});
    res.json(services);
});

app.get('/tabs', async (req, res) => {
    const tabs = await Tab.find({});
    res.json(tabs);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});