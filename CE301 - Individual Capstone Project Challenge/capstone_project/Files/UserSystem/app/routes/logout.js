var express = require('express');
var router = express.Router();

var passport = require('passport');

// Get logout page
router.get('/logout', (req, res) => {

  // Database connection
  var connection = require('../database.js');

  // Grab user id
  var id = req.user.user_id || req.session.passport.user;

  // Get user information and events from database
  connection.query('SELECT * FROM users WHERE id = ?', [id], (error, result) => {

    if (error) {

      res.redirect("/login");

    } else {

      req.logout()
      req.session.destroy(() => {
        res.clearCookie('connect.sid')
        res.redirect('/')
      })

    }
  });
});

module.exports = router;
