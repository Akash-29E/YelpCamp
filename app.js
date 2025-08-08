const express = require('express');
const mongo = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const path = require('path');
const Campground = require('./models/campground');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('./schemas')
const Joi = require('joi');
const campground = require('./models/campground');
const Review = require('./models/review');


app.use(methodOverride('_method'));
app.use(express.static('views'))

mongo.connect('mongodb://localhost:27017/yelp-camp');

const db = mongo.connection;
db.once('open', () => {
    console.log('Database Connected!');
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

const validateCampground = (req,res,next) => {
    console.log(req.body)
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req,res,next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
}));

app.get('/campgrounds/new', catchAsync(async (req, res) => {
    const campground = undefined;
    res.render('campground/form', { campground });
}));

app.post('/campgrounds/new',validateCampground, catchAsync(async (req, res) => { 
    const campground = new Campground(req.body.campground);
    await campground.save();
    console.log('here1');
    res.redirect(`/campgrounds/${campground._id}`);
}));


app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    console.log('here2');
    if (!campground) throw new ExpressError('Campground not found', 404);
    res.render('campground/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) throw new ExpressError('Campground not found', 404);
    // console.log(campground);
    res.render('campground/form', { campground });
}));

app.put('/campgrounds/:id/edit',validateCampground, catchAsync(async (req, res) => {
    const id = req.params.id;
    console.log(id);
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, req.body, { options: { returnDocument: 'after' } });
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndDelete(id);
    console.log(campground.title, 'Deleted!');
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req,res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))


app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong!' } = err;
    console.log(err.stack);
    res.status(status).render('error', { err, status, message });
})

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page not found!', 404))
});


app.listen(3000, () => {
    console.log('Serving on port 3000!')
});