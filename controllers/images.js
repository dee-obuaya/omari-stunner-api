const Image = require('../models/image');
const Service = require('../models/service');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
    // console.log('fetching images with query:', req.query);
    // parse query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // ------ Filters ------
    const filters = {};
    if (req.query.service && req.query.service !== 'All') {
        const serviceDoc = await Service.find({ tag: req.query.service.toLowerCase() });
        // console.log('found service doc:', serviceDoc);
        if (serviceDoc) filters.service = serviceDoc.map(s => s._id);
        // console.log('applied service filter:', filters.service);
    }

    const skip = (page - 1) * limit;

    // ------ Queries ------
    const [images, total] = await Promise.all([
        Image.find(filters)
            .skip(skip)
            .limit(limit)
            .populate('service', 'service'),
        Image.countDocuments(filters),
    ]);
    // const images = await Image.find({}).populate('service', 'service');

    // console.log(images);
    // ------ Response ------
    // if (images.length > 0) {
        res.status(200).json({
            images: images,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            },
        });
    // } else {
    //     res.status(404).json({message: 'No images found'});
    // };
};

module.exports.uploadImage = async (req, res) => {
    const imageData = {
        url: req.file.path,
        filename: req.file.filename,
        name: req.file.originalname,
    };

    // res.send({message: 'File uploaded successfully', file: imageData, service: req.body.service});

    const serviceTag = await Service.findOne({service: req.body.service});
    // console.log('found service: ', serviceTag);

    const newImage = new Image({
        image: imageData,
        service: serviceTag._id
    });
    // newImage.service = serviceTag._id;

    await newImage.save();
    // console.log('saved image: ', newImage);
    res.status(200).json(newImage);
};

module.exports.uploadImages = async (req, res) => {
    // console.log('hit endpoint');
    // console.log(req.body);

    if (!req.files || !req.body.service) {
        return res.status(400).json({ message: 'File and service are required.' });
    };

    const images = req.files.map(f => ({url: f.path, filename: f.filename}));

    res.send({message: 'File uploaded successfully', images: images, service: req.body.service});

    // const newImage = new Image({
    //     link: file,
    //     service: [service],
    // });
    // await newImage.save();
    // res.status(200).json(newImage);
};

module.exports.importImages = async (req, res) => {
    // console.log('hit endpoint');
    // console.log(req.body);

    if (!req.file || !req.body.service) {
        return res.status(400).json({ message: 'File and service are required.' });
    };

    res.send({message: 'Files uploaded successfully', file: req.file, service: req.body.service});

    // const newImage = new Image({
    //     link: file,
    //     service: [service],
    // });
    // await newImage.save();
    // res.status(200).json(newImage);
};

module.exports.deleteImage = async (req, res) => {
    const { id } = req.params;

    const deletedImage = await Image.findByIdAndDelete(id);
    if (!deletedImage) {
        res.status(404).json({ message: 'Could not delete image' });
        throw new ExpressError(404, 'Could not delete image');
    }

    res.status(200).json({ message: 'Image deleted successfully' });
};