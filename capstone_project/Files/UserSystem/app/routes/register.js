var express = require('express');
var router = express.Router();

var passport = require('passport');

var expressValidator = require('express-validator');

var bcrypt = require('bcryptjs');
var saltRounds = 10;

// Get register page
router.get('/register', (req, res, next) => {

  res.render('register', {
    title: 'Registration',
    errors: false,
    form: false,
    userCheck: false,
    emailCheck: false
  });

});

// Post register page
router.post('/register', (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Form data
  var form = {

    username: req.body.username,
    password: req.body.password,
    passwordMatch: req.body.passwordMatch,
    email: req.body.email

  };

  // Form validation
  req.checkBody('username', 'Username field cannot be empty.').notEmpty();
  req.checkBody('username', 'Username must be between 4-15 characters long.').len(5, 15);
  req.checkBody('username', 'Username can only contain letters, numbers, or underscores.').matches(/^[A-Za-z0-9_-]+$/, 'i');
  req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);
  req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
  req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);

  var errors = req.validationErrors();

  if (errors) {

    res.render('register', {
      title: 'Registration Error',
      errors: errors,
      form: form
    });

  } else {

    // User information
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    // Database check
    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, userCheck) => {
      connection.query('SELECT * FROM users WHERE email = ?', [email], (error, emailCheck) => {

        // Check if username or email is taken
        if (userCheck.length > 0 || emailCheck.length > 0) {

          res.render('register', {
            title: 'Registration Error',
            errors: errors,
            form: form,
            userCheck: userCheck,
            emailCheck: emailCheck
          });

        // Else create account
        } else {

          // Insert into database
          bcrypt.hash(password, saltRounds, function(error, hash) {

            if (error) throw error

            // Insert into database
            connection.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hash, email], (error, result, fields) => {

              if (error) throw error

              // Select the id of the person who registerd
              connection.query('SELECT LAST_INSERT_ID() AS user_id', (error, result) => {

                if (error) throw error

                // Hold the user id
                var user_id = result[0].user_id

                // Redirect to the profile page
                req.login(user_id, (error) => {

                  res.redirect('/profile');
                });
              });
            })
          });
        }
      });
    });
  }
});

// Keep user id in passport
passport.serializeUser((user_id, done) =>  {
  done(null, user_id);
});

// Keep user id in passport
passport.deserializeUser((user_id, done) => {
  done(null, user_id);
});

module.exports = router;
