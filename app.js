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
const passport = require('passport');
const LocalStratergy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');

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
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/fakeUser',async (req,res) => {
    const user = new User({ email: 'colttt1@gmail.com', username: 'colttt1', });
    const newUser = await User.register(user, 'chicken1');
    res.send(newUser);
})

app.get('/', (req, res) => {
    res.render('home');
});

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong!' } = err;
    console.log(err.stack);
    res.status(status).render('error', { err, status, message });
})

app.use((req, res, next) => {
    console.log('Unmatched request:', req.method, req.url);
    next();
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page not found!', 404));
});

app.listen(3000, () => {
    console.log('Serving on port 3000!')
});