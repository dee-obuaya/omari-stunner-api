const User = require('../models/user');


module.exports.getUsers = async (req, res) => {
    const users = await User.find({});

    if (users.length > 0) {
        res.status(200).json({ users: users });
    } else {
        res.json({message: 'No users found'});
    };
};

module.exports.addUser = async (req, res) => {
    try{
        const {name, username, password, role} = req.body.user;

        const user = new User({name, username, role});
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);

        res.status(200).json({user: registeredUser.name});
    } catch (e) {
        res.status(400).json({message: e.message})
    }
};

module.exports.updateUser = async (req, res) => {
    try{
        const {id} = req.params;
        const {name, username, password, role} = req.body.user;

        const user = User.findByIdAndUpdate(id, {name, username, role}, { new: true, runValidators: true });
        // const registeredUser = await User.register(user, password);
        // console.log(registeredUser);

        res.status(200).json({user: user.name});
    } catch (e) {
        res.status(400).json({message: e.message})
    }
};

module.exports.deleteUser = async (req, res) => {};