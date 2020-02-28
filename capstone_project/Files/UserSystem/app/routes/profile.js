var express = require('express');
var router = express.Router();

var upload = require("../multer/user");

var fs = require("fs");

// Get profile page
router.get("/profile", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Grab user id
  var id = req.user.user_id || req.session.passport.user;

  // Get user information and events from database
  connection.query('SELECT * FROM users WHERE id = ?', [id], (user_error, user_result) => {
    connection.query('SELECT * FROM events WHERE author_id = ? ORDER BY startDate ASC, startTime ASC', [id], (event_error, event_result) => {
      connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [id, 1, id, 1], (friendList_error, friendList_result) => {
        connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ? AND friendRequestId != ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ? AND friendRequestId != ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [id, 2, id, id, 2, id], (friendRequest_error, friendRequest_result) => {

          if (user_error || event_error || friendList_error || friendRequest_error) {

            res.redirect("/login");

          } else {

            res.render("profile", {
              title: 'Profile',
              user: user_result[0],
              event: event_result,
              friends: friendList_result,
              friendRequest: friendRequest_result,
              profileErrors: false,
              profilePictureErrorMessage: false,
              profileSuccessMessage: req.flash('profileSuccessMessage'),
              friendErrorMessage: false,
              friendSuccessMessage: req.flash('friendSuccessMessage'),
            });

          }
        });
      });
    });
  });
});

// Post profile page
router.post("/profile", authenticationMiddleware(), (req, res, next) => {

  upload(req, res, (error) => {

    // Database connection
    var connection = require('../database.js');

    // Form validation
    req.checkBody('firstName', 'First name is to long.').len(0, 45);
    req.checkBody('firstName', 'First name can only contain letters').matches(/^(|[a-zA-Z])+$/);
    req.checkBody('lastName', 'Last name is to long.').len(0, 45);
    req.checkBody('lastName', 'Last name can only contain letters').matches(/^(|[a-zA-Z])+$/);
    req.checkBody('mobileNumber', 'Mobile can contain numbers only.').matches(/^(|\d)+$/);
    req.checkBody('mobileNumber', 'Mobile number is to long.').len(0, 14);

    var profileErrors = req.validationErrors();

    // Grab user id
    var user_id = req.user.user_id || req.session.passport.user;

    // Get user information and events from database
    connection.query('SELECT * FROM users WHERE id = ?', [user_id], (user_error, user_result) => {
      connection.query('SELECT * FROM events WHERE author_id = ? ORDER BY startDate ASC, startTime ASC', [user_id], (event_error, event_result) => {
        connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [user_id, 1, user_id, 1], (friendList_error, friendList_result) => {
          connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ? AND friendRequestId != ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ? AND friendRequestId != ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [user_id, 2, user_id, user_id, 2, user_id], (friendRequest_error, friendRequest_result) => {

            if (user_error || event_error || friendList_error || friendRequest_error) throw user_error || event_error || friendList_error || friendRequest_error

            if (error) {

              if (error.code === 'LIMIT_FILE_SIZE') {

                res.render('profile', {
                  title: 'Profile',
                  user: user_result[0],
                  event: event_result,
                  friends: friendList_result,
                  friendRequest: friendRequest_result,
                  profileErrors: profileErrors,
                  profilePictureErrorMessage: 'Image exceeds 125kb! Try another picture',
                  profileSuccessMessage: false,
                  friendErrorMessage: false,
                  friendSuccessMessage: false
                });

              }

              if (error.code === 'LIMIT_FILE_TYPE') {

                res.render('profile', {
                  title: 'Profile',
                  user: user_result[0],
                  event: event_result,
                  friends: friendList_result,
                  friendRequest: friendRequest_result,
                  profileErrors: profileErrors,
                  profilePictureErrorMessage: 'Please use jpeg, jpg or png for the profile picture',
                  profileSuccessMessage: false,
                  friendErrorMessage: false,
                  friendSuccessMessage: false
                });

              }

            } else if (profileErrors) {

              res.render('profile', {
                title: 'Profile',
                user: user_result[0],
                event: event_result,
                friends: friendList_result,
                friendRequest: friendRequest_result,
                profileErrors: profileErrors,
                profilePictureErrorMessage: false,
                profileSuccessMessage: false,
                friendErrorMessage: false,
                friendSuccessMessage: false
              });

            } else {

              // User information
              var firstName = req.body.firstName;
              var lastName = req.body.lastName;
              var mobileNumber = req.body.mobileNumber;
              var user_id = req.user.user_id || req.session.passport.user;

              if (req.file == undefined) {

                var avatar = user_result[0].profilePicture

              } else {

                fs.unlink("./users/avatars/" + user_result[0].profilePicture, (error) => {

                  if (error) {

                    console.log("Failed to locate image");

                  } else {

                    console.log('Removed image');

                  }

                });

                var avatar = req.file.filename;
              }

              // Update previous user information with new ones
              connection.query('UPDATE users SET firstName = ?, lastName = ?, mobile = ?, profilePicture = ? WHERE id = ?', [firstName, lastName, mobileNumber, avatar, user_id], (error, results, fields) => {

                if (error) throw error;

              });

              console.log("Profile Updated")
              req.flash('profileSuccessMessage', 'Update Complete');
              res.redirect("/profile")

            }
          });
        });
      });
    });
  });
});

// Authentication middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login')
  }
}

module.exports = router;
