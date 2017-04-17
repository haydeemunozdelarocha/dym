var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var db = require('../../db.js');

router.get('/', function(req,res,err){
  var getBanco = 'SELECT * FROM banco';
    db.query(getBanco, function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.get('/:id', function(req,res,err){
  var banco_id = req.params.id;
  var getBanco = 'SELECT * FROM banco WHERE banco_id = ?';
    db.query(getBanco,[banco_id], function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.get('/materiales/:id', function(req,res,err){
  var banco_id = req.params.id;
  var obra_id = req.user.obra_id;
  var getBanco = 'SELECT * FROM banco WHERE banco_id = ?;';
  var getMateriales = 'SELECT materiales.id, conceptos.nombre_concepto FROM materiales JOIN conceptos ON materiales.concepto = conceptos.conceptos_id JOIN proveedores ON materiales.proveedor_id = proveedores.id WHERE materiales.proveedor_id = ? AND materiales.obra_id = ?'
    db.query(getBanco,[banco_id], function(err, banco){
    if(err) throw err;
    else {
        var proveedor_id = banco[0].proveedor_id;
            db.query(getMateriales,[proveedor_id,obra_id], function(err, materiales){
                if(err) throw err;
                else {
                    res.json({banco:banco,materiales:materiales});
                }
              });
    }
  });
})

router.post('/', function(req,res,err){
  console.log(req.body)
  var obra_id = req.body.obra_id;
  var proveedor_id = req.body.proveedor_id;
  var distancia = req.body.distancia;
  var cuota_tiradero = req.body.cuota_tiradero;
  var postBanco = 'INSERT INTO banco(obra,proveedor_id,distancia,cuota_tiradero) VALUE(?,?,?,?)';
    db.query(postBanco,[obra_id,proveedor_id,distancia,cuota_tiradero], function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

module.exports = router;
