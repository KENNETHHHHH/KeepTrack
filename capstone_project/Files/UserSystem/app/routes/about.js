var express = require('express');
var router = express.Router();

// Get about page
router.get('/about', (req, res, next) => {

  if (!req.isAuthenticated()) {

    res.render('about', {
      title: 'Home',
      user: false
    });

  } else {

    // Database connection
    var connection = require('../database.js');

    // Grab user id
    var id = req.user.user_id || req.session.passport.user;

    // Get user information and events from database
    connection.query('SELECT * FROM users WHERE id = ?', [id], (error, result) => {

      if (error) {

        res.redirect("/login");

      } else {

        res.render('about', {
          title: 'About',
          user: result[0]
        });

      }
    });
  }
});

module.exports = router;
