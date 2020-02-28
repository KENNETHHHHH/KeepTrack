var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var multer = require("multer");

// Authentication Packages
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');

// Routes
var index = require('./routes/index');
var profile = require('./routes/profile');
var userprofile = require('./routes/userprofile');
var about = require('./routes/about');
var contact = require('./routes/contact');
var event = require('./routes/event');
var register = require('./routes/register');
var login = require('./routes/login');
var logout = require('./routes/logout');
var eventdelete = require('./routes/eventdelete');
var eventedit = require('./routes/eventedit');
var eventinvite = require('./routes/eventinvite');
var friends = require('./routes/friends');
var friendsdelete = require('./routes/friendsdelete');
var friendsaccept = require('./routes/friendsaccept');
var friendsdecline = require('./routes/friendsdecline');
var reset = require('./routes/reset');

var app = express();

require('dotenv').config();

app.use(express.static("./users/avatars"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var database = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

var sessionStore = new MySQLStore(database);

app.use(session({
  secret: 'o60v5fz9u2d6q299uv9z',
  resave: false,
  store: sessionStore,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use('/', index);
app.use('/', about);
app.use('/', profile);
app.use('/', userprofile);
app.use('/', contact);
app.use('/', register);
app.use('/', event);
app.use('/', login);
app.use('/', logout);
app.use("/", eventdelete);
app.use("/", eventedit);
app.use("/", eventinvite);
app.use("/", friends);
app.use("/", friendsdelete);
app.use("/", friendsaccept);
app.use("/", friendsdecline);
app.use("/", reset);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
