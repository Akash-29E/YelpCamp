const express = require('express');
const mongo = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const path = require('path');
const Campground = require('./models/campground');
const ejsMate = require('ejs-mate');

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

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
});

app.get('/campgrounds/new', async (req, res) => {
    const campground = undefined;
    res.render('campground/form', { campground });
});

app.post('/campgrounds/new', async (req, res) => {
    const campground = new Campground(req.body);
    console.log(campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});


app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campground/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // console.log(campground);
    res.render('campground/form', { campground });
});

app.put('/campgrounds/:id/edit', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, req.body, { options: { returnDocument: 'after' } });
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndDelete(id);
    console.log(campground.title, 'Deleted!');
    res.redirect('/campgrounds');
})



app.listen(3000, () => {
    console.log('Serving on port 3000!')
});