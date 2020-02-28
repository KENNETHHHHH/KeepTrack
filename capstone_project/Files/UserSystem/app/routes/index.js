var express = require('express');
var router = express.Router();

// Get index page
router.get('/', (req, res, next) => {

  if (!req.isAuthenticated()) {

    res.render('index', {
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

        res.render('index', {
          title: 'Home',
          user: result[0]
        });

      }
    });
  }
});


module.exports = router;
