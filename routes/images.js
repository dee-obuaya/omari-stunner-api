const express = require('express');
const router = express.Router();
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

const images = require('../controllers/images');
const handleAsync = require('../utils/handleAsync');
const {validateImage, isLoggedIn} = require('../utils/middleware');


router.route('/')
    .get(isLoggedIn, handleAsync(images.index))
    .post(isLoggedIn, upload.single('image'), validateImage, handleAsync(images.uploadImage));
isLoggedIn

router.post('/multiple', isLoggedIn, upload.array('image'), handleAsync(images.uploadImages));


router.post('/import', isLoggedIn, upload.single('file'), handleAsync(images.importImages));


router.delete('/:id', isLoggedIn, handleAsync(images.deleteImage));


module.exports = router;