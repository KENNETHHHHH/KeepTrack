var express = require('express');
var router = express.Router();

// Post event invite
router.post("/event/invite/:id/:event_id", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Selected event id
  var id = req.params.id;
  var eventId = req.params.event_id;

  // Insert new event invite into database
  connection.query('INSERT INTO invites (events_id, friend_id, inviteStatus) VALUES (?, ?, ?)', [eventId, id, 2], (error) => {

    // If event cant be deleted
    if (error) {

      res.redirect("/profile");

    // Else complete and redirect
    } else {

      req.flash('friendInviteSuccessMessage', 'Event invite sent');
      res.redirect('back');

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
