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

const sample = arr => arr[Math.floor(Math.random() * arr.length)];

function getRandomImage(imgs) {
  const index = Math.floor(Math.random() * imgs.length);
  return imgs.splice(index, 1)[0]; // removes from array
}

console.log(getRandomImage(images).urls.regular);

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 15; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '68a4a41b6e11e6965b9ef062',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quibusdam soluta minus ipsam dicta unde. Repudiandae, repellendus cum veritatis consectetur facilis exercitationem repellat maxime quis. Cum commodi nobis dolores impedit vitae!',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            image: `${getRandomImage(images).urls.regular}`,
            price: Math.floor(Math.random() * 20) + 10
        })
        await camp.save();
    };
}

seedDB().then(() => {
    mongoose.connection.close()
});