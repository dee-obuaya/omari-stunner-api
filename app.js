if (process.env.NODE_ENV !=='production') {
    require('dotenv').config();
};

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const dbName = process.env.DB;
const ExpressError = require('./utils/ExpressError');

const services = require('./routes/services');
const images = require('./routes/images');
const tabs = require('./routes/tabs');

mongoose.connect(`mongodb://localhost:27017/${dbName}`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected successfully');
});

const app = express();
const port = process.env.PORT;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/services', services)

app.use('/api/images', images);

app.use('/api/tabs', tabs);
// if setting /:id here, got to route file and add {mergeParams: true} to express.Router(add here)


app.get('/', (req, res) => {
    res.send('Hello from Omari Stunner!');
});

const handleValidationError = err => {
    return new ExpressError(400, `Validation Failed: ${err.message}`);
};

const handleCastError = err => {
    return new ExpressError(400, `Invalid entry: ${err.message}`);
};

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
    console.log(err);
    switch (err.name) {
        case 'ValidationError':
            err = handleValidationError(err);
            break;
        case 'CastError':
            err = handleCastError(err);
            break;
        default:
            break;
    };

    next(err);
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).send({message: message});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});