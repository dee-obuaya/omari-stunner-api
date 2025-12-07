if (process.env.NODE_ENV !=='production') {
    require('dotenv').config();
};

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const http = require('http');
const { Server } = require('socket.io');


const dbUrl = process.env.DB_URL;
const ExpressError = require('./utils/ExpressError');
const {handleValidationError, handleCastError} = require('./utils/errorHandlers');
const buildSession = require('./utils/session');
const initChatSocket = require('./sockets/chatSocket');

// Model Imports
const User = require('./models/user')

// Router Imports
const serviceRouter = require('./routes/services');
const imageRouter = require('./routes/images');
const tabRouter = require('./routes/tabs');
const bookingRouter = require('./routes/bookings');
const dashboardRouter = require('./routes/dashboard');
const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const messageRouter = require('./routes/messages');
const chatRouter = require('./routes/chat');

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected successfully');
});

const app = express();
const port = process.env.PORT;

// const sessionConfig = {
//     secret: process.env.SESSION_KEY,
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({
//         mongoUrl: dbUrl,
//         collectionName: 'sessions',
//         // ttl: 60 * 60,
//     }),
//     cookie: {
//         httpOnly: true,
//         // expires: Date.now() + 1000 * 60 * 60, //Date.now() + ms * s * m * h * d
//         maxAge: 1000 * 60 * 60,
//         secure: process.env.NODE_ENV === 'production'
//     },
//     rolling: true, // refresh expiry on every request
// }

// Configure CORS

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// attach session
const sessionMiddleware = buildSession(dbUrl);
app.use(sessionMiddleware);

// initialize passport and session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use('/api/services', serviceRouter)

app.use('/api/images', imageRouter);

app.use('/api/tabs', tabRouter);
// if setting /:id here, got to route file and add {mergeParams: true} to express.Router(add here)

app.use('/api/bookings', bookingRouter);

app.use('/api/dashboard', dashboardRouter);

app.use('/api/users', userRouter);

app.use('/auth', authRouter);

app.use('/api/messages', messageRouter);

app.use('/api/chats', chatRouter);


app.get('/', (req, res) => {
    res.send('Hello from Omari Stunner!');
});


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

const server = http.createServer(app);

// Setup Socket.io with the server
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Share session middleware with Socket.io
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// initialize chat socket with io & db
initChatSocket(io);

// switch to server.listen so Socket.IO and Express share the same underlying server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});