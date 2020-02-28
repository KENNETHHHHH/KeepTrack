var express = require('express');
var router = express.Router();

// Get event page
router.get('/event', authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Grab user id
  var id = req.user.user_id || req.session.passport.user;

  // Get user information and events from database
  connection.query('SELECT * FROM users WHERE id = ?', [id], (error, result) => {
    connection.query('SELECT * FROM (SELECT friendId, userOneId, userTwoId, friendStatus FROM friends WHERE (userOneId = ? AND friendStatus = ?) UNION ALL SELECT friendId, userTwoId, userOneId, friendStatus FROM friends WHERE (userTwoId = ? AND friendStatus = ?)) AS tb1 INNER JOIN users ON tb1.userTwoId = users.id', [id, 1, id, 1], (friendList_error, friendList_result) => {

      if (error || friendList_error) {

        res.redirect("/login");

      } else {

        res.render('event', {
          title: 'Event',
          user: result[0],
          friends: friendList_result,
          eventErrors: false,
          eventForm: false
        });

      }
    });
  });
});


// Post event page
router.post("/event", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Form data
  var eventForm = {

    title: req.body.title,
    time: req.body.time,
    details: req.body.details

  };

  // Form validation
  req.checkBody('title', 'Title field cannot be empty.').notEmpty();
  req.checkBody('title', 'Title is to long.').len(0, 45);
  req.checkBody('title', 'Title can only contain letters').matches(/^(|[a-zA-Z\s])+$/);

  var eventErrors = req.validationErrors();

  // Grab user id
  var id = req.user.user_id || req.session.passport.user;

  // Get user information and events from database
  connection.query('SELECT * FROM users WHERE id = ?', [id], (error, result) => {

    // Check if errors occured
    if (eventErrors) {

      res.render('event', {
        title: 'Event',
        user: result[0],
        eventErrors: eventErrors,
        eventForm: eventForm,
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
      var id = req.user.user_id || req.session.passport.user;

      // Insert new event values into database
      connection.query('INSERT INTO events (title, eventType, startTime, endTime, startDate, endDate, details, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [title, eventType, startTime, endTime, startDate, endDate, details, id], (error) => {

        if (error) throw error;

      });
      req.flash('profileSuccessMessage', 'Event created');
      res.redirect("/profile")
    }
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
