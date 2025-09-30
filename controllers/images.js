const Image = require('../models/image');
const Service = require('../models/service');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
    const images = await Image.find({}).populate('service', 'service');

    if (images.length > 0) {
        res.status(200).json(images);
    } else {
        res.status(404).json({message: 'No images found'});
    };
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
        res.status(404).json({ message: 'Image not found.' });
        throw new ExpressError(404, 'Image Not Found');
    }

    res.status(200).json({ message: 'Image deleted successfully.' });
};