var express = require('express');
var router = express.Router();

// Get event edit page
router.get("/user/:id", authenticationMiddleware(), (req, res, next) => {

      // Database connection
      var connection = require('../database.js');

      // Grab user id
      var user_id = req.user.user_id || req.session.passport.user;

      // Selected event id
      var friend = req.params.id;

      // Get user information and events from database
      connection.query('SELECT * FROM users WHERE id = ?', [friend], (user_error, user_result) => {

          if (user_error) {

            res.redirect("/login");

          } else {

            res.render("user", {

              title: user_result[0].username,
              user: user_result[0]

            });
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
