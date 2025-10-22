const express = require('express');
const router = express.Router();
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

const images = require('../controllers/images');
const handleAsync = require('../utils/handleAsync');
const {validateImage} = require('../utils/middleware');


router.route('/')
    .get(handleAsync(images.index))
    .post(upload.single('image'), validateImage, handleAsync(images.uploadImage));


router.post('/multiple', upload.array('image'), handleAsync(images.uploadImages));


router.post('/import', upload.single('file'), handleAsync(images.importImages));


router.delete('/:id', handleAsync(images.deleteImage));


module.exports = router;