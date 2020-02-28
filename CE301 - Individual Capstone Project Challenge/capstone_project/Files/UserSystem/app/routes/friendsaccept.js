var express = require('express');
var router = express.Router();

// Get event delete
router.get("/friends/accept/:id", authenticationMiddleware(), (req, res, next) => {

  // Database connection
  var connection = require('../database.js');

  // Selected event id
  var friendId = req.params.id;

  // Query to delete selected event
  connection.query('UPDATE friends SET friendStatus = ? WHERE friendId = ?', [1, friendId], (error, results, fields) => {

    console.log(friendId);

    // If event cant be deleted
    if (error) {

      res.redirect("/profile");

    // Else complete and redirect
    } else {

      req.flash('profileSuccessMessage', 'Frind Accepted');
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
