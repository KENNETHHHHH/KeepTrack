var express = require('express');
var router = express.Router();

var passport = require('passport');
var localStrategy = require('passport-local');

var bcrypt = require('bcryptjs');
var saltRounds = 10;

// Get reset page
router.get('/reset', (req, res, next) => {

  res.render('reset', {
    title: 'Change Password',
    errors: false,
    usernameError: false,
    userCheck: false
  });

});

// Post register page
router.post('/reset', (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Form validation
  req.checkBody('newPassword', 'New Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody("newPassword", "New Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  req.checkBody('newPassword', 'New Passwords do not match, please try again.').equals(req.body.newPasswordMatch);

  var errors = req.validationErrors();

  if (errors) {

    res.render('reset', {
      
      title: 'Change Password',
      errors: errors,
      userCheck: false

    });

  } else {

    // User information
    var username = req.body.username;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var newPasswordMatch = req.body.newPasswordMatch;

    // Database check
    connection.query('SELECT * FROM users WHERE username = ?', [username], (error, userCheck) => {

      // Check if username cant be found
      if (userCheck != null || userCheck != undefined || userCheck != 0) {

        res.render('reset', {

          title: 'Change Password',
          errors: errors,
          userCheck: userCheck

        });

        //
      } else {


        res.render('reset', {

          title: 'Hello',
          errors: false,
          userCheck: false



        });
        //
        //         // Insert into database
        //         bcrypt.hash(newPassword, saltRounds, function(error, hash) {
        //
        //           if (error) throw error
        //
        //           // Insert into database
        //           connection.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, username], (error, results, fields) => {
        //
        //             if (error) throw error
        //
        //                 res.redirect('/login');
        //               });
        //             });
        //
        //         });
        //       }
        //     });
        //   });
        // }
      }
    });
  }
});

module.exports = router;
