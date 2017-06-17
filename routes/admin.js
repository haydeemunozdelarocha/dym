var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');
var db = require('../db.js');
var passport = require('passport');
var rp = require('request-promise');

// var path = 'http://localhost:3000/';
var path = 'http://dymingenieros.herokuapp.com/';

router.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

 function isLoggedIn(req, res, next){
  console.log('is logged in?')
    if (req.isAuthenticated()) {
      console.log(req.user)
      next();
    }else{
      res.redirect('/login');
    }
  };

/* GET home page. */
router.get('/obras', isLoggedIn, function(req, res, next) {
  var obra_id = req.user.obra_id;
  var usuario = req.user;
  var getObra = 'SELECT * FROM obras WHERE obra_id = ?;';
  var getEmpleados = 'SELECT * FROM empleados WHERE obra = ?;';
  var getPresupuesto = 'SELECT presupuestos.*,conceptos.nombre_concepto,zonas.nombre_zona FROM presupuestos JOIN conceptos ON presupuestos.concepto = conceptos.conceptos_id JOIN zonas ON presupuestos.zona = zonas.zonas_id WHERE obra = ? ORDER BY zona;';
    db.query(getObra,[obra_id], function(err, obra){
    if(err) throw err;
    else {
        db.query(getPresupuesto,[obra_id], function(err, presupuestos){
        if(err) throw err;
        else {
              db.query(getEmpleados,[obra_id], function(err, empleados){
              if(err) throw err;
              else {
                res.render('obra', { title: obra[0].nombre_obra, obra: obra[0], presupuestos:presupuestos,empleados:empleados, usuario: usuario });
              }
            });
        }
      });
    }
  });
});

router.get('/acarreos',isLoggedIn, function(req,res,err){
    console.log('getting acarreos');
  var usuario = req.user;
  var obra_id = req.user.obra_id;
  console.log(path+'api/acarreos/obra/'+obra_id)
    request(path+'api/acarreos/obra/'+obra_id, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      acarreos = JSON.parse(body);
      console.log(acarreos)
        res.render('acarreos', { title: 'Acarreos', acarreos: acarreos, usuario: usuario });
    } else if (error){
      console.log(error)
    }
  })
})

router.get('/empleados', isLoggedIn, function(req, res, next) {
  var usuario = req.user;
    request.get(path+'api/empleados/', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var empleados = JSON.parse(body);
    res.render('empleados', { title: 'Empleados', empleados: empleados, usuario: usuario });
  }
})
});

router.get('/estimaciones', isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var obra_id = req.user.obra_id;
    request.get(path+'api/estimaciones/obra/'+obra_id, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var estimaciones = JSON.parse(body);
    res.render('estimaciones', { title: 'Estimaciones', estimaciones: estimaciones, usuario: usuario });
  }
})
});

module.exports = router;
