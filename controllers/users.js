const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.renderLogin = (req, res) => {
    const link = req.get('Referer');
    console.log(link)
    res.render('users/login', { link });
}

module.exports.submitLogin = (req, res) => {
    req.flash('success', 'Welcome Back!');
    console.log('REQ.BODY::', req.body);
    const redirectUrl = req.body.link || '/campgrounds';
    // console.log(redirectUrl);
    res.redirect(redirectUrl);
}

module.exports.onLogout = (req, res) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash('success', 'Successfully Logged out!');
        res.redirect('/campgrounds');
    });
}

module.exports.submitRegister = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        })
        console.log(registeredUser);
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}