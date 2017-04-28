var express = require('express');
var router = express.Router();
var db = require('../db.js');
var passport = require('passport');
var rp = require('request-promise');

var path = "http://localhost:3000/"
/* GET users listing. */
router.get('/', function(req, res, next) {
});

router.post('/signup', passport.authenticate('local-signup', {
            successReturnToOrRedirect : '/empleados',
            failureRedirect : '/empleados',
            failureFlash : 'true',
            session:false
}));

router.post('/login', passport.authenticate('local-login', {failureRedirect : '/login',
    failureFlash : 'true'
}),function(req,res,err){
  console.log('login from user routes')
    if(req.user.categoria === 'checador'){
    res.redirect('/captura');
  } else if(req.user.categoria === 'residente'){
    var obra_id = req.user.obra_id;
    res.redirect('/obra/'+obra_id)
  } else if (req.user.categoria === 'administrador'){
    res.redirect('/administrador')
  } else {
    console.log(req.user)
  }
  if (err) {
    console.log(err)
  };
}
);

router.get('/auth/nest', passport.authenticate('nest'), function(req, res){
  console.log('sending request')
});

router.get('/auth/nest/callback',passport.authenticate('nest'),
  function(req, res) {
    console.log("callback")
    var user = req.cookies.user;
    var user_id = user.id_usuario;
    var accessToken = req.user.accessToken;
    console.log(accessToken,user_id)
    var updateUsuario = 'UPDATE usuarios SET accessToken = ? WHERE id_usuario = ?';
    db.query(updateUsuario,[accessToken,user_id], function(err, usuario){
    if(err) throw err;
    else {
        console.log(usuario)
        console.log(req.user)
       req.logout();
       res.redirect('/captura')
      }
  });
})


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
