const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')



router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    console.log(review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Rating added!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    const a = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    console.log(a)
    req.flash('success', 'Review deleted!');
    res.redirect(`/campgrounds/${id}`)
}))


module.exports = router;