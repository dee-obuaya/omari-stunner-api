const express = require('express');
const router = express.Router();
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

const images = require('../controllers/images');
const handleAsync = require('../utils/handleAsync');
const {validateImage, ensureAuthenticated} = require('../utils/middleware');


router.route('/')
    .get(ensureAuthenticated, handleAsync(images.index))
    .post(ensureAuthenticated, upload.single('image'), validateImage, handleAsync(images.uploadImage));


router.post('/multiple', ensureAuthenticated, upload.array('image'), handleAsync(images.uploadImages));


router.post('/import', ensureAuthenticated, upload.single('file'), handleAsync(images.importImages));


router.delete('/:id', ensureAuthenticated, handleAsync(images.deleteImage));


module.exports = router;