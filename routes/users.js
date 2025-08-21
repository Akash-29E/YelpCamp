const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.get('/login', (req, res) => {
    const link = req.session.returnTo;
    res.render('users/login', { link });
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back!');
    console.log('REQ.BODY::', req.body);
    const redirectUrl = req.body.link || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash('success', 'Successfully Logged out!');
        res.redirect('/campgrounds');
    });
})

router.post('/register', catchAsync(async (req, res, next) => {
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
}));


module.exports = router;