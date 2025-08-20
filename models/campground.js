const { string, required } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const { Schema, model } = mongoose;

const CampGroundSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        default: 'https://t4.ftcdn.net/jpg/15/83/21/39/360_F_1583213929_OxAxzK3C6njLJAahBdwq0Usa83iwS8FM.jpg'
    },
    description: {
        type:String,
        default: 'No Description Provided'    
    },
    location: {
        type:String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
    ,
    reviews:[{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

CampGroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports = model('Campground', CampGroundSchema);