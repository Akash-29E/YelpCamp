const { string, required } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const { Schema, model } = mongoose;

const ImageSchema = new Schema({
    url:String,
    filename: String,
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
})

const CampGroundSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: [ImageSchema],
    description: {
        type: String,
        default: 'No Description Provided'
    },
    location: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
    ,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

CampGroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = model('Campground', CampGroundSchema);