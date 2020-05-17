const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const async = require('async');
const nodemailer = require('nodemailer');

//Requiring user model
const User = require('../models/usermodel');

// Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please Login first to access this page.')
    res.redirect('/login');
}

//Get routes
router.get('/login', (req,res)=> {
    res.render('login');
});

router.get('/signup', (req,res)=> {
    res.render('signup');
});

router.get('/dashboard', isAuthenticatedUser,(req,res)=> {
    res.render('dashboard');
});

router.get('/logout', isAuthenticatedUser,(req, res)=> {
    req.logOut();
    req.flash('success_msg', 'You have been logged out.');
    res.redirect('/login');
});
//POST routes
router.post('/login', passport.authenticate('local', {
    successRedirect : '/dashboard',
    failureRedirect : '/login',
    failureFlash: 'Invalid email or password. Try Again!!!'
}));


router.post('/signup', (req, res)=> {
    let {name, email, password} = req.body;

    let userData = {
        name : name,
        email :email
    };

    User.register(userData, password, (err, user)=> {
        if(err) {
            req.flash('error_msg', 'ERROR: '+err);
            res.redirect('/signup');
        }
        passport.authenticate('local') (req, res, ()=> {
            req.flash('success_msg', 'Account created successfully');
            res.redirect('/login');
        });
    });

});

router.post('/password/change', (req, res)=> {
    if(req.body.password !== req.body.confirmpassword) {
        req.flash('error_msg', "Password don't match. Type again!");
        return res.redirect('/password/change');
    }

    User.findOne({email : req.user.email})
        .then(user => {
            user.setPassword(req.body.password, err=>{
                user.save()
                    .then(user => {
                        req.flash('success_msg', 'Password changed successfully.');
                        res.redirect('/dashboard');
                    })
                    .catch(err => {
                        req.flash('error_msg', 'ERROR: '+err);
                        res.redirect('/password/change');
                    });
            });
        });
});

// Routes to handle forgot password

module.exports = router;