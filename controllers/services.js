const Service = require('../models/service');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
    const services = await Service.find({});

    if (services.length > 0) {
        res.status(200).json(services);
    } else {
        res.status(404).json({message: 'No service found'});
        throw new ExpressError(400, 'No service found');
    };
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