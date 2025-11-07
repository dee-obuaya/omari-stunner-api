const User = require('../models/user');
const AdminAction = require('../models/actions');
const {invalidateUserSessions} = require('../utils/invalidateSessions');


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
        const {name, username, role} = req.body.user;

        const user = User.findByIdAndUpdate(id, {name, username, role}, { new: true, runValidators: true });

        res.status(200).json({user: user.name});
    } catch (e) {
        res.status(400).json({message: e.message})
    }
};

module.exports.resetPassword = async (req, res) => {
    const {id} = req.params
    const {password} = req.body.user;
    console.log(password);

    try {
        // Ensure the requester is an admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only.' });
        }

        // Find target user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({message: 'User not found.'});
        }

        // Update password safely
        await user.setPassword(password);
        await user.save();

        // Invalidate sessions
        const invalidated = await invalidateUserSessions(req.sessionStore, user._id);

        if (invalidated.acknowledged) {
            await AdminAction.create({
                admin: req.user._id,
                targetUser: user._id,
                action: 'invalidate_sessions',
                message: `Admin ${req.user.username} invalidated all sessions for ${user.username}`,
            });
        };


        // Log the action
        await AdminAction.create({
            admin: req.user._id,
            targetUser: user._id,
            action: 'reset_password',
            message: `Admin ${req.user.username} reset password for ${user.username}`,
        });



        res.status(200).json({message: `${user.name}'s password updated successfully and sessions invalidated.`});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error while resetting password' });
    }
};

module.exports.deleteUser = async (req, res) => {};