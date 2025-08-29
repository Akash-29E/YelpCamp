const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.postReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    console.log(review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Rating added!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    const a = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    console.log(a)
    req.flash('success', 'Review deleted!');
    res.redirect(`/campgrounds/${id}`)
}