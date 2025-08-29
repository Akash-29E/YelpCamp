const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

router.get('/', catchAsync(campgrounds.index));

router.route('/new')
    .get(isLoggedIn, catchAsync(campgrounds.renderNewForm))
    .post(isLoggedIn, validateCampground,upload.array('campground[image]'), catchAsync(campgrounds.createCampground));
    
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

router.route('/:id/edit')
    .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
    .put(isLoggedIn, isAuthor, validateCampground, upload.array('campground[image]'), catchAsync(campgrounds.editCampground));

module.exports = router;