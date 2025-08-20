const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware')

const validateCampground = (req, res, next) => {
    console.log(req.body)
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
}));

router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    const campground = undefined;
    console.log(req.user)
    res.render('campground/form', { campground });
}));

router.post('/new', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully Made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));


router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews').populate('author');
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Sorry, Cannot find that Campground!');
        return res.redirect('/campgrounds')
        // throw new ExpressError('Campground not found', 404);
    }
    const reviews = campground.reviews;
    // console.log(campground, reviews._id);
    res.render('campground/show', { campground, reviews });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Sorry, Cannot find that Campground!');
        return res.redirect('/campgrounds')
        // throw new ExpressError('Campground not found', 404);
    }
    // console.log(campground);
    res.render('campground/form', { campground });
}));

router.put('/:id/edit', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { options: { returnDocument: 'after' } });
    // console.log(campground);
    req.flash('success', 'Successfully Updated Campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    console.log(campground.title, 'Deleted!');
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}));

module.exports = router;