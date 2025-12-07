const session = require('express-session');
const MongoStore = require('connect-mongo');

module.exports = function buildSession(dbUrl) {
    return session({
        name: 'omari.sid',
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: dbUrl,
            collectionName: 'sessions',
            // ttl: 60 * 60,
        }),
        cookie: {
            httpOnly: true,
            // expires: Date.now() + 1000 * 60 * 60, //Date.now() + ms * s * m * h * d
            maxAge: 1000 * 60 * 60,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
        rolling: true, // refresh expiry on every request
    });
}