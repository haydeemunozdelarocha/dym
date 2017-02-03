var express = require('express');
var router = express.Router();
var db = require('../db.js');
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.user.categoria === 'checador'){
    res.redirect('/captura');
  } else if(req.user.categoria === 'residente'){
    var obra_id = req.user.obra_id;
    res.redirect('/obra/'+obra_id)
  }
});

router.post('/signup', passport.authenticate('local-signup', {
            successReturnToOrRedirect : '/empleados',
            failureRedirect : '/'
}));

router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/users',
            failureRedirect : '/login'
}));

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/auth/nest', passport.authenticate('nest'), function(req, res){
  console.log('sending request')
});

router.get('/auth/nest/callback', passport.authenticate('nest'),
  function(req, res) {
    console.log("callback")
    var user = req.cookies.user;
    var user_id = user.id_usuario;
    console.log(user);
    var accessToken = req.user.accessToken;
    var updateUsuario = 'UPDATE usuarios SET accessToken = ? WHERE id_usuario = ?';
    db.query(updateUsuario,[accessToken,user_id], function(err, usuario){
    if(err) throw err;
    else {
          res.redirect('/captura')
          }
    });
  });


// router.post('/signin', function(req,res,next){
//   var username = req.body.username;
//   var password = req.body.password;
//   console.log(req.body.username)
//   console.log(req.body.password)
//       db.query("SELECT * FROM `usuarios` WHERE `username` = '" + username + "'",function(err,rows){
//       if (err)
//                 return err;
//        if (!rows.length) {
//                  res.send('No user found.');
//             }

//       // if the user is found but the password is wrong
//             if (!( rows[0].password == password))
//                 res.send('Wrong password.');// create the loginMessage and save it to session as flashdata

//             // all is well, return successful user
//             return  req.logIn(rows[0], function (err) {
//                     if (err) {
//                         return err;
//                     } else if(req.user.categoria === "checador") {
//                         if(!req.user.accessToken) {
//                         res.cookie('user', req.user,{ maxAge: 900000 });
//                           return res.redirect('/auth/nest')
//                         }
//                         return res.redirect('/captura');
//                     } else if (req.user.categoria === "residente"){
//                       var obra = req.user.obra_id;
//                       return res.redirect('/residentes/obra');
//                     }
//                 });

//     });
// });

module.exports = router;
