var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var NestStrategy = require('passport-nest').Strategy;
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var db = require('./db.js');

var routes = require('./routes/index');
var users = require('./routes/users');
var residentes = require('./routes/residentes');
var admin = require('./routes/admin');
var obras = require('./routes/api/obras');
var proveedores = require('./routes/api/proveedores');
var materiales = require('./routes/api/materiales');
var camiones = require('./routes/api/camiones');
var acarreos = require('./routes/api/acarreos');
var conceptos = require('./routes/api/conceptos');
var empleados = require('./routes/api/empleados');
var zonas = require('./routes/api/zonas');
var estimaciones = require('./routes/api/estimaciones');
var presupuestos = require('./routes/api/presupuestos');
var checadores = require('./routes/api/checadores');
var fletes = require('./routes/api/fletes');
var banco = require('./routes/api/banco');
var auth = require('./routes/api/auth');
var photo = require('./routes/photo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

//Passport oAuth for NEST Camera

var SUPER_SECRET_KEY = 'keyboard-cat';
var NEST_API_URL = 'https://developer-api.nest.com';

passport.use(new NestStrategy({
  // Read credentials from your environment variables.
  clientID: process.env.NEST_ID,
  clientSecret: process.env.NEST_SECRET,
  authorizationURL: 'https://home.nest.com/login/oauth2?client_id=9f4b110f-72f9-40e0-8c83-b4b03d5d3f55&state=foo'
}));

//Local passport strategy
passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
          console.log(req.body)
            db.query("SELECT * FROM usuarios WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, {error:"Username already taken.", empleado_id:req.body.empleado_id}, console.log('That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
                        empleado_id: req.body.empleado_id,
                        obra_id:req.body.obra_id,
                        categoria:req.body.categoria
                    };
                    console.log(newUserMysql)
                    var insertQuery = "INSERT INTO usuarios(username, password,empleado_id,obra_id,categoria) values (?,?,?,?,?)";

                    db.query(insertQuery, [newUserMysql.username, newUserMysql.password, newUserMysql.empleado_id,newUserMysql.obra_id,newUserMysql.categoria], function(err, rows) {
                      console.log(insertQuery)
                      console.log(newUserMysql.username, newUserMysql.password)
                      console.log(rows);
                        newUserMysql.usuario_id= rows.insertId;
                        console.log(newUserMysql.usuario_id)
                            return done(null, newUserMysql);
                        })
                }
            });
        })
    );

passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            db.query("SELECT * FROM usuarios WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, console.log('No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, console.log('Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );


//Storing sessions on MySQL
var options = {
    cookie : { httpOnly: true, maxAge: 3600000*24 },
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

var sessionStore = new MySQLStore(options, db);

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
  cookie:{maxAge:new Date(Date.now() + (3600000*24))},
  store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', routes);
app.use('/users', users);
app.use('/photo', photo);
app.use('/residentes', residentes);
app.use('/admin', admin);
app.use('/api/obras', obras);
app.use('/api/proveedores', proveedores);
app.use('/api/materiales', materiales);
app.use('/api/camiones', camiones);
app.use('/api/acarreos', acarreos);
app.use('/api/conceptos', conceptos);
app.use('/api/empleados', empleados);
app.use('/api/zonas', zonas);
app.use('/api/presupuestos', presupuestos);
app.use('/api/estimaciones', estimaciones);
app.use('/api/checadores', checadores);
app.use('/api/fletes', fletes);
app.use('/api/banco', banco);
app.use('/api/auth', auth);

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
  if(req.user){
      var usuario = req.user;
  } else {
    var usuario = {categoria:'checador'};
  }
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    usuario: usuario
  });
});


module.exports = app;
