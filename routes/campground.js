const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

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


router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews', 
        populate: {
            path: 'author',
        }
    }).populate('author');
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

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
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

router.put('/:id/edit',isLoggedIn,isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, req.body.campground, { options: { returnDocument: 'after' } });
    req.flash('success', 'Successfully Updated Campground!')
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You don\'t have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    const camp = await Campground.findByIdAndDelete(id);
    console.log(camp.title, 'Deleted!');
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}));

module.exports = router;