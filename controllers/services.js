const Service = require('../models/service');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
    // console.log(req.query);
    try {
        // parse query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sort || 'created_at';
        const sortOrder = req.query.order?.toLowerCase() === 'desc' ? -1 : req.query.order?.toLowerCase() === 'asc' ? 1 : 1;

        // ------ Filters ------
        const filters = {};
        if (req.query.tag && req.query.tag !== 'All') {
            filters.tag = req.query.tag;
        };
        if (req.query.search) {
            filters.$or = [
                // { 'service.tag': { $regex: req.query.search, $options: 'i' } },
                { 'service.name': { $regex: req.query.search, $options: 'i' } }
            ];
        };

        const skip = (page - 1) * limit

        // ------ Queries ------
        const [services, total] = await Promise.all([
            Service.find(filters)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit),
                Service.countDocuments(filters),
        ]);

        // ------ Response ------
        if (services.length > 0) {
            res.status(200).json({
                services: services,
                pagination: {
                    totalItems: total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                }
            });
        } else {
            res.status(404).json({message: 'No service found'});
        };
    } catch (e) {
        console.error(e);
        res.status(500).json({message: 'Failed to fetch services'});
    }
};

module.exports.addService = async (req, res) => {
    const {service, tag, price} = req.body;

    const newService = new Service({
        service: service,
        tag: tag,
        price: price,
    });

    await newService.save();
    res.status(200).json(newService);
};

module.exports.updateService = async(req, res) => {
    // console.log(req.body)
    const {id} = req.params;
    const {service, tag, price} = req.body;

    const updatedService = await Service.findByIdAndUpdate(id, {service, tag, price}, { new: true, runValidators: true });

    if (!updatedService) {
        res.status(400).json({message: 'Could not update service'});
        throw new ExpressError(404, 'Could not update service');
    };

    res.status(200).json(updatedService);
};

module.exports.deleteService = async (req, res) => {
    const { id } = req.params;

    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
        return res.status(400).json({ message: 'Could not delete service' });
    }

    res.json({ message: 'Service deleted successfully' });
};