var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var NestStrategy = require('passport-nest').Strategy;
var flash = require('connect-flash');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var db = require('./db.js');

var routes = require('./routes/index');
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

var options = {
    host: process.env.DYM_DB_HOST,
    port: 3306,
    user     : process.env.DYM_DB_USER,
    password : process.env.DYM_DB_PSS,
    database : 'heroku_aa5f4bff4de7c3d',
    checkExpirationInterval: 900000,// How frequently expired sessions will be cleared; milliseconds.
    expiration: 86400000,// The maximum age of a valid session; milliseconds.
    createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
    connectionLimit: 1,// Number of connections when creating a connection pool
    cookie : { httpOnly: true, maxAge: 2419200000 },
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

var sessionStore = new MySQLStore(options);

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
  key: 'session_cookie_name',
  secret: SUPER_SECRET_KEY,
  resave: true,
  saveUninitialized: false,
  cookie:{maxAge:new Date(Date.now() + 3600000)},
  store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use('/', routes);
app.use('/users', users);
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
