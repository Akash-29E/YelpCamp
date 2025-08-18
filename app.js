const express = require('express');
const mongo = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campground');
const reviews = require ('./routes/reviews');
const flash = require('connect-flash');



mongo.connect('mongodb://localhost:27017/yelp-camp');

const db = mongo.connection;
db.once('open', () => {
    console.log('Database Connected!');
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'agoodsecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 604800000,
        maxAge: 604800000,
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);



app.get('/', (req, res) => {
    res.render('home');
});

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