var express = require('express');
var router = express.Router();

// Get event delete
router.get("/profile/friends", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Grab user id
  var id = req.user.user_id || req.session.passport.user;

  // Get user information and events from database
  connection.query('SELECT * FROM users WHERE id = ?', [id], (user_error, user_result) => {
    connection.query('SELECT * FROM events WHERE author_id = ?', [id], (event_error, event_result) => {
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
            profileSuccessMessage: false,
            friendErrorMessage: false,
            friendSuccessMessage: false
          });

        }
      });
    });
  });
});
});

// Post profile page
router.post("/profile/friends", authenticationMiddleware(), (req, res, next) => {

    // Database connection
    var connection = require('../database.js');

    // Grab user id
    var user_id = req.user.user_id || req.session.passport.user;

    // Friend username
    var friendUsername = req.body.friendUsername;

    // Get user information and events from database
    connection.query('SELECT * FROM users WHERE id = ?', [user_id], (userId_error, userId_result) => {
      connection.query('SELECT * FROM users WHERE username = ?', [friendUsername], (username_error, username_result) => {
        connection.query('SELECT * FROM events WHERE author_id = ?', [user_id], (event_error, event_result) => {
          connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [user_id, 1, user_id, 1], (friendList_error, friendList_result) => {
            connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ? AND friendRequestId != ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ? AND friendRequestId != ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [user_id, 2, user_id, user_id, 2, user_id], (friendRequest_error, friendRequest_result) => {

            if (userId_error || username_error || event_error || friendList_error || friendRequest_error) throw userId_error || username_error || event_error || friendList_error || friendRequest_error

            if (friendUsername == null || friendUsername == undefined || friendUsername.length === 0) {

              res.render('profile', {
                title: 'Profile',
                user: userId_result[0],
                event: event_result,
                friends: friendList_result,
                friendRequest: friendRequest_result,
                profileErrors: false,
                profilePictureErrorMessage: false,
                profileSuccessMessage: false,
                friendErrorMessage: '\u26A0 Friend cannot be empty',
                friendSuccessMessage: false
              });

            }

            else if (username_result == null || username_result == undefined || username_result.length === 0) {

              res.render('profile', {
                title: 'Profile',
                user: userId_result[0],
                event: event_result,
                friends: friendList_result,
                friendRequest: friendRequest_result,
                profileErrors: false,
                profilePictureErrorMessage: false,
                profileSuccessMessage: false,
                friendErrorMessage: '\u26A0 User cannot be found',
                friendSuccessMessage: false
              });

            }

            else if (username_result[0].id === user_id) {

              res.render('profile', {
                title: 'Profile',
                user: userId_result[0],
                event: event_result,
                friends: friendList_result,
                friendRequest: friendRequest_result,
                profileErrors: false,
                profilePictureErrorMessage: false,
                profileSuccessMessage: false,
                friendErrorMessage: '\u26A0 Cant add yourself',
                friendSuccessMessage: false
              });

            }

            else {

              var friendId = username_result[0].id;


              console.log(friendId);

              connection.query('SELECT * FROM friends WHERE userOneId = ? AND userTwoId = ? OR userOneId = ? AND userTwoId = ?;', [user_id, friendId, friendId, user_id], (friendCheck_error, friendCheck_result) => {

                console.log(friendCheck_result);

                console.log(friendUsername);

                if (friendCheck_result.length >= 1 && friendCheck_result[0].friendStatus === 1) {

                  res.render('profile', {
                    title: 'Profile',
                    user: userId_result[0],
                    event: event_result,
                    friends: friendList_result,
                    friendRequest: friendRequest_result,
                    profileErrors: false,
                    profilePictureErrorMessage: false,
                    profileSuccessMessage: false,
                    friendErrorMessage: '\u26A0 You are already friends',
                    friendSuccessMessage: false
                  });

                }

                else if (friendCheck_result.length >= 1) {

                  res.render('profile', {
                    title: 'Profile',
                    user: userId_result[0],
                    event: event_result,
                    friends: friendList_result,
                    friendRequest: friendRequest_result,
                    profileErrors: false,
                    profilePictureErrorMessage: false,
                    profileSuccessMessage: false,
                    friendErrorMessage: '\u26A0 Friend request pending',
                    friendSuccessMessage: false
                  });

                }

                else {

                  // Insert new friend values into database
                  connection.query('INSERT INTO friends (userOneId, userTwoId, friendStatus, friendRequestId) VALUES (?, ?, ?, ?)', [user_id, username_result[0].id, 2, user_id], (error) => {

                    if (error) throw error;

                  req.flash('friendSuccessMessage', 'Friend Request Sent');
                  res.redirect("/profile");

                });
              }
            });
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
