const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
}

module.exports.renderNewForm = async (req, res) => {
    const campground = undefined;
    console.log(req.user)
    res.render('campground/form', { campground });
}

module.exports.createCampground = async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.image = req.files.map(f => ({url: f.path, filename:f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully Made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews', 
        populate: {
            path: 'author',
        }
    }).populate('author');
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Sorry, Cannot find that Campground!');
        return res.redirect('/campgrounds')
        // throw new ExpressError('Campground not found', 404);
    }
    const reviews = campground.reviews;
    // console.log(campground, reviews._id);
    res.render('campground/show', { campground, reviews });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Sorry, Cannot find that Campground!');
        return res.redirect('/campgrounds')
        // throw new ExpressError('Campground not found', 404);
    }
    // console.log(campground);
    res.render('campground/form', { campground });
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const camp = await Campground.findByIdAndUpdate(id, req.body.campground, { options: { returnDocument: 'after' } });
    imgs = req.files.map(f => ({url: f.path, filename:f.filename }));
    camp.image.push(...imgs);
    await camp.save();
    if (req.body.deleteImages){
        for (let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
            }
        await camp.updateOne({$pull: {image: {filename: {$in: req.body.deleteImages}}}});
        console.log(camp);
        
    }
    req.flash('success', 'Successfully Updated Campground!')
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You don\'t have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    const camp = await Campground.findByIdAndDelete(id);
    console.log(camp.title, 'Deleted!');
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}