var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');
var db = require('../../db.js');
var passport = require('passport');
var rp = require('request-promise');

var path = 'http://locahost:3000/';

router.get('/logout', function(req, res, next) {
req.logout();
res.redirect('/');
});

router.post('/signin', function(req,res,next){
  var username = req.body.username;
  var password = req.body.password;
  console.log(req.body.username)
  console.log(req.body.password)
      db.query("SELECT * FROM `usuarios` WHERE `username` = '" + username + "'",function(err,rows){
      if (err)
                return err;
       if (!rows.length) {
                 res.send('No user found.');
            }

      // if the user is found but the password is wrong
            if (!( rows[0].password == password))
                res.send('Wrong password.');// create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return  req.logIn(rows[0], function (err) {
                    if (err) {
                        return err;
                    } else if(req.user.categoria === "checador") {
                        if(!req.user.accessToken) {
                        res.cookie('user', req.user,{ maxAge: 900000 });
                          return res.send('No accessToken Token')
                        }
                        return res.send(req.user);
                    }
                });

    });
});

module.exports = router;
