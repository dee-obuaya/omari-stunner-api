const Message = require('../models/message');

module.exports.index = async (req, res) => {
    try {
        // parse query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sort || 'created_at';
        const sortOrder = req.query.order === 'desc' ? -1 : 1;

        // ----- Filters ------
        const filters = {};
        if (req. query.search) {
            filters.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        // ----- Queries ------
        const [messages, total] = await Promise.all([
            Message.find(filters)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit),
            Message.countDocuments(filters),
        ]);

        // ----- Response ------
        if (messages.length > 0) {
            res.status(200).json({
                messages: messages,
                pagination: {
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                },
            });
        } else {
            res.status(404).json({ message: 'No messages found' });
        };
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

module.exports.createMessage = async (req, res) => {
    const { message } = req.body;

    const newMessage = new Message({ ...message });

    await newMessage.save();

    res.status(201).json({ message: 'Message created successfully', data: newMessage });
};

module.exports.deleteMessage = async (req, res) => {
    const { id } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(id);
    if (!deletedMessage) {
        return res.status(404).json({ message: 'Message not found' });
    };

    res.status(200).json({ message: 'Message deleted successfully' });
};