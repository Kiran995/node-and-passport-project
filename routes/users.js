const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User')

router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // validation for required fields
    if(!name || !email || !password || !password2){
        errors.push({ msg: "please fill all the fields value" })
    }

    // Match password
    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match'})
    }

    //  Check password length
    if(password.length < 8){
        errors.push({ msg: 'Password should be at least 8 characters' })
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        // Validation pass
        User.findOne({ email: email })
            .then(user => {
                if(user){
                    errors.push({ msg: 'Email already exists' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    }) 
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in')
                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err))
                    }))
                }
            })
    }
});

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})


// Logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login')
})

module.exports = router;