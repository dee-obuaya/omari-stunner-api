const Tab = require('../models/tab');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
    const tabs = await Tab.find({});

    if (tabs.length > 0) {
        res.status(200).json({tabs: tabs});
    } else {
        res.status(404).json({message: 'No tabs found'});
        throw new ExpressError(404, 'Tabs Not Found');
    };
};

module.exports.addTab = async (req, res) => {
    const {name, label, active} = req.body;

    const newTab = new Tab({
        name: name,
        label: label,
        active: active,
    });

    await newTab.save();
    res.status(200).json({tab: newTab, message: 'Tab added successfully.'});
};

module.exports.updateTab = async(req, res) => {
    const {id} = req.params;
    const {name, label, active} = req.body;

    const updatedTab = await Tab.findByIdAndUpdate(id, {name, label, active}, { new: true, runValidators: true });

    if (!updatedTab) {
        res.status(400).json({message: 'Could not update tab'});
        throw new ExpressError(404, 'Could not update tab');
    }
    res.status(200).json({tab: updatedTab, message: 'Tab updated successfully.'});
};

module.exports.deleteTab = async (req, res) => {
    const { id } = req.params;

    const deletedTab = await Tab.findByIdAndDelete(id);

    if (!deletedTab) {
        return res.status(400).json({ message: 'Could not delete tab' });
    };

    res.json({ message: 'Tab deleted successfully.' });
};