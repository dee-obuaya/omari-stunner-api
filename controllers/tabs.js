const Tab = require('../models/tab');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
    const tabs = await Tab.find({});

    if (tabs.length > 0) {
        res.status(200).json(tabs);
    } else {
        res.status(404).json({message: 'No tabs found'});
        throw new ExpressError(404, 'Tabs Not Found');
    };
};