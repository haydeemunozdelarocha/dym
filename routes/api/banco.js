var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var db = require('../../db.js');

router.get('/todos', function(req,res,err){
  console.log('bancos back')
  var getBanco = 'SELECT proveedores.id AS banco, proveedores.razon_social FROM proveedores;';
    db.query(getBanco, function(err, banco){
    if(err) throw err;
    else {
      console.log(banco)
        res.json(banco)
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
  var getBanco = 'SELECT fletes.banco AS banco,proveedores.razon_social FROM fletes JOIN proveedores ON fletes.banco = proveedores.id WHERE proveedor_id = ? AND fletes.banco != 0;';

    db.query(getBanco,[banco_id], function(err, banco){
    if(err) throw err;
    else {
      console.log(banco)
        res.json(banco)
    }
  });
})

router.get('/acarreoext/:id', function(req,res,err){
  var proveedor_id = req.params.id;
  console.log(proveedor_id)
  var getBanco = 'SELECT fletes.banco,proveedores.razon_social FROM fletes LEFT JOIN proveedores ON fletes.banco = proveedores.id WHERE fletes.proveedor_id = ? AND fletes.banco != 0;';
    db.query(getBanco,[proveedor_id], function(err, banco){
    if(err) throw err;
    else {
        res.json(banco)
    }
  });
})


router.get('/material/', function(req,res,err){
  var obra_id = req.user.obra_id;
  console.log(proveedor_id)
  var getBanco = 'SELECT materiales.proveedor_id AS banco,proveedores.razon_social FROM materiales JOIN proveedores ON materiales.proveedor_id = proveedores.id WHERE obra_id = ? AND materiales.categoria = "material";';
    db.query(getBanco,[obra_id], function(err, banco){
    if(err) throw err;
    else {
        res.json(banco)
    }
  });
})

router.get('/banco/:camionid', function(req,res,err){
 var camion_id = req.params.camionid;
  var getBanco = 'SELECT (case when banco = 0 then fletes.proveedor_id else banco end) as banco,(case when razon_social is null then (SELECT proveedores.razon_social FROM camiones JOIN proveedores ON camiones.proveedor_id =proveedores.id WHERE camion_id = '+camion_id+') else razon_social end) as razon_social FROM fletes LEFT JOIN proveedores ON fletes.banco = proveedores.id WHERE proveedor_id = (SELECT proveedor_id FROM camiones WHERE camion_id = '+camion_id+') ;';
    db.query(getBanco, function(err, banco){
    if(err) throw err;
    else {
        res.json(banco)
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
