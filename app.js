var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var NestStrategy = require('passport-nest').Strategy;
var session = require('express-session');
var db = require('./db.js');

var routes = require('./routes/index');
var camera = require('./routes/camera');
var photo = require('./routes/photo');
var users = require('./routes/users');
var obras = require('./routes/api/obras');
var proveedores = require('./routes/api/proveedores');
var materiales = require('./routes/api/materiales');
var camiones = require('./routes/api/camiones');
var acarreos = require('./routes/api/acarreos');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

var SUPER_SECRET_KEY = 'keyboard-cat';
var NEST_API_URL = 'https://developer-api.nest.com';


passport.use(new NestStrategy({
  // Read credentials from your environment variables.
  clientID: process.env.NEST_ID,
  clientSecret: process.env.NEST_SECRET,
  authorizationURL: 'https://home.nest.com/login/oauth2?client_id=9f4b110f-72f9-40e0-8c83-b4b03d5d3f55&state=foo'
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: SUPER_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie:{maxAge:6000}
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);
app.use('/camera', camera);
app.use('/photo', photo);
app.use('/api/obras', obras);
app.use('/api/proveedores', proveedores);
app.use('/api/materiales', materiales);
app.use('/api/camiones', camiones);
app.use('/api/acarreos', acarreos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace

/**
 * When authentication fails, present the user with
 * an error requesting they try the request again.
 */

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
