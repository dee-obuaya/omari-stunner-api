module.exports.isAuthenticated = (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({
            loggedIn: true,
            user: req.user,
            maxAge: req.session.cookie.maxAge,
        });
    } else {
        res.status(401).json({ loggedIn: false });
    }
};

module.exports.logInUser = async (req, res) => {
    // console.log('Cookie expires:', req.session.cookie.expires);
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
    req.logout((err) => {
        if (err) {
            return next(err);
        };
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({success: true});
        });
    });
};