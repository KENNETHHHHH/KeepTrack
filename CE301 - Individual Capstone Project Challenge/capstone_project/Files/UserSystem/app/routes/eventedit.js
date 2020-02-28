var express = require('express');
var router = express.Router();

// Get event edit page
router.get("/edit/:id", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Grab user id
  var user_id = req.user.user_id || req.session.passport.user;

  // Selected event id
  var event_id = req.params.id;

  // Get user information and events from database
  connection.query('SELECT * FROM users WHERE id = ?', [user_id], (user_error, user_result) => {
    connection.query('SELECT * FROM events WHERE event_id = ?', [event_id], (event_error, event_result) => {
      connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [user_id, 1, user_id, 1], (friendList_error, friendList_result) => {

        if (user_error || event_error || friendList_error) {

          res.redirect("/login");

        } else {

          res.render("edit", {
            title: 'Edit Event',
            user: user_result[0],
            event: event_result[0],
            friends: friendList_result,
            eventErrors: false,
            form: false,
            profileSuccessMessage: req.flash('msg'),
            friendInviteSuccessMessage: req.flash('friendInviteSuccessMessage'),
          });

        }
      });
    });
  });
});

router.post("/edit/:id", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Grab user id
  var user_id = req.user.user_id || req.session.passport.user;

  // Selected event id
  var event_id = req.params.id;

  // Form validation
  req.checkBody('title', 'Title field cannot be empty.').notEmpty();
  req.checkBody('title', 'Title is to long.').len(0, 45);
  req.checkBody('title', 'Title can only contain letters').matches(/^(|[a-zA-Z\s])+$/);

  var eventErrors = req.validationErrors();

  // Get user information and events from database
  connection.query('SELECT * FROM users WHERE id = ?', [user_id], (user_error, user_result) => {
    connection.query('SELECT * FROM events WHERE event_id = ?', [event_id], (event_error, event_result) => {
      connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [user_id, 1, user_id, 1], (friendList_error, friendList_result) => {

        if (user_error || event_error || friendList_error) throw user_error || event_error || friendList_error

        // Check if errors occured
        if (eventErrors) {

          res.render('edit', {
            title: 'Edit Event',
            user: user_result[0],
            event: event_result[0],
            eventErrors: eventErrors,
            friends: friendList_result,
            profileSuccessMessage: false,
            friendInviteSuccessMessage: false
          });

        } else {

          // User information
          var title = req.body.title;
          var eventType = req.body.eventType;
          var startTime = req.body.startTime;
          var endTime = req.body.endTime;
          var time = req.body.time;
          var startDate = req.body.startDate;
          var endDate = req.body.endDate;
          var details = req.body.details;

          connection.query('UPDATE events SET title = ?, eventType = ?, startTime = ?, endTime = ?, startDate = ?, endDate = ?, details = ? WHERE event_id = ?', [title, eventType, startTime, endTime, startDate, endDate, details, event_id], (error, results, fields) => {

            if (error) throw error

          });

          req.flash('profileSuccessMessage', 'Event Edited');
          res.redirect("/profile")
        }
      });
    });
  });
});

// Authentication Middleware
function authenticationMiddleware() {
  return (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login')
  }
}

module.exports = router;
