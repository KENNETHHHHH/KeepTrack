var express = require('express');
var router = express.Router();

var passport = require('passport');
var localStrategy = require('passport-local');

var bcrypt = require('bcryptjs');

// Get login page
router.get('/login', (req, res) => {

  res.render('login', {
    title: 'Login',
    message:req.flash('loginMessage')
  });

});

// Create new local stratergy
passport.use(new localStrategy( { passReqToCallback : true }, (req, username, password, done) => {

  // Database connection
  var connection = require('../database.js');

  // Select user from the database
  connection.query('SELECT id, password FROM users WHERE username = ?', [username], (error, result) => {

      if (error) throw error;

      // Check if user cant be found
      if (result == null || result == undefined || result.length === 0) {

        return done(null, false, req.flash('loginMessage', 'No User Found'));

      }

      // Hash the password
      var hash = result[0].password.toString();

      // Comapre the hashed password with the database password
      bcrypt.compare(password, hash, (error, response) => {

        // Check if password is correct
        if (response === true) {

          return done(null, { user_id: result[0].id });

        } else {

          return done(null, false,  req.flash('loginMessage', 'Invalid password' ));

        }
      });
    });
}));

// Post login page
router.post('/login', passport.authenticate('local', {

  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true

}));

module.exports = router;
