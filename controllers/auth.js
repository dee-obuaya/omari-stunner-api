const User = require('../models/user');

module.exports.isAuthenticated = (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({
            authenticated: true,
            user: req.user,
            maxAge: req.session.cookie.maxAge,
        });
    } else {
        res.status(401).json({ authenticated: false });
    }
};

module.exports.logInUser = async (req, res) => {
    console.log('Cookie expires:', req.session.cookie.expires);
    // console.log('Max age:', req.session.cookie.maxAge);

    const user = req.authenticatedUser;

    // console.log('logged in: ', user);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        user: user,
        maxAge: req.session.cookie.maxAge,
    });
};

module.exports.logOutUser = async (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({success: true});
        });
    });
};