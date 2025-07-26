const mongo = require('mongoose');
const cities = require('./cities');
const images = require('./images')
const { descriptors, places } = require('./seedHelpers')
const Campground = require('../models/campground');
const { default: mongoose } = require('mongoose');

mongo.connect('mongodb://localhost:27017/yelp-camp');

const db = mongo.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', () => {
    console.log('Database Connected!');
});

const sample = arr => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quibusdam soluta minus ipsam dicta unde. Repudiandae, repellendus cum veritatis consectetur facilis exercitationem repellat maxime quis. Cum commodi nobis dolores impedit vitae!',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            image: `${sample(images).urls.regular}`,
            price: Math.floor(Math.random() * 20) + 10
        })
        await camp.save();
    };
}

seedDB().then(() => {
    mongoose.connection.close()
});