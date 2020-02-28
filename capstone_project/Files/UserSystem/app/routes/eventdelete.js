var express = require('express');
var router = express.Router();

// Get event delete
router.get("/profile/delete/:id", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Selected event id
  var event_id = req.params.id;

  // Query to delete selected event
  connection.query('DELETE FROM events WHERE event_id = ?', [event_id], (error, result) => {

    // If event cant be deleted
    if (error) {

      res.redirect("/profile");

    // Else complete and redirect
    } else {

      req.flash('profileSuccessMessage', 'Event Deleted');
      res.redirect("/profile");

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
