const express = require('express');
const mongo = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const path = require('path');
const Campground = require('./models/campground');

// app.use(methodOverride('_method'));

mongo.connect('mongodb://localhost:27017/yelp-camp');

const db = mongo.connection;
db.once('open', () => {
    console.log('Database Connected!');
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', {campgrounds});
});

app.get('/campgrounds/new', async (req, res) => {
    const campground = null;
    res.render('campground/form' ,{campground});
});

app.post('/campgrounds/new', async (req, res) => {
    const campground = new Campground(req.body);
    await campground.save()
});


app.get('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campground/show', {campground});
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    // console.log(campground);
    res.render('campground/form', {campground});
});

app.post('/campgrounds/:id/edit', async(req,res) => {    
    const id = req.params.id?req.params.id:'000000aaaaaa4dedd21c65f1';
    console.log(id);
    console.log(req.body);
    // if (!id){
    //     const campground = new Campground(req.body); 
    //     await campground.save();
    //     console.log(campground);
    //     res.redirect(`/campgrounds/${campground._id}`);
    // } else {
    // }
    const campground = await Campground.findByIdAndUpdate(id, req.body, {options:{upsert:true, returnDocument:'after', new:true}});
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
})



app.listen(3000, () => {
    console.log('Serving on port 3000!')
});