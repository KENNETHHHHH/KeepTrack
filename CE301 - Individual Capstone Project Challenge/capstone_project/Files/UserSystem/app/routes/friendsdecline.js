var express = require('express');
var router = express.Router();

// Get event delete
router.get("/friends/decline/:id", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Selected event id
  var friendId = req.params.id;

  // Query to delete selected event
  connection.query('DELETE FROM friends WHERE friendId = ?', [friendId], (error, result) => {

    console.log(friendId);

    // If event cant be deleted
    if (error) {

      res.redirect("/profile");

    // Else complete and redirect
    } else {

      req.flash('profileSuccessMessage', 'Friend request declined');
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
