var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var db = require('../../db.js');

router.post('/', function(req,res,err){
  console.log(req.body)
  var obra_id = req.body.obra_id;
  var proveedor_id = req.body.proveedor_id;
  var precio1 = req.body.precio1;
  var precio2 = req.body.precio2;
  var unidad = req.body.unidad;
  var postFlete = 'INSERT INTO fletes(obra_id,proveedor_id,precio1,precio2,unidad) VALUE(?,?,?,?,?)';
    db.query(postFlete,[obra_id,proveedor_id,precio1,precio2,unidad], function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.post('/interno', function(req,res,err){
  var obra_id = req.user.obra_id;
  var proveedor_id = req.body.proveedor_id;
    console.log(obra_id,proveedor_id)
  var getPrecio = 'SELECT * FROM fletes WHERE proveedor_id = ? AND obra_id = ?';
    db.query(getPrecio,[proveedor_id,obra_id], function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.get('/externo', function(err,res){
  var getPrecio = 'SELECT recibos.recibo_id,recibos.hora,recibos.foto, acarreos.estimacion,acarreos.acarreo_id,acarreos.categoria,proveedores.razon_social, conceptos.nombre_concepto,zonas.nombre_zona FROM acarreos JOIN recibos ON recibos.recibo_id = acarreos.recibo_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN proveedores ON camiones.proveedor_id = proveedores.id OR materiales.proveedor_id = proveedores.id LEFT JOIN conceptos ON acarreos.concepto_flete=conceptos.conceptos_id OR materiales.concepto = conceptos.conceptos_id ORDER BY acarreos.acarreo_id ASC';
    db.query(listaAcarreos, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/material', function(err,res){
  var getPrecio = 'SELECT recibos.recibo_id,recibos.hora,recibos.foto, acarreos.estimacion,acarreos.acarreo_id,acarreos.categoria,proveedores.razon_social, conceptos.nombre_concepto,zonas.nombre_zona FROM acarreos JOIN recibos ON recibos.recibo_id = acarreos.recibo_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN proveedores ON camiones.proveedor_id = proveedores.id OR materiales.proveedor_id = proveedores.id LEFT JOIN conceptos ON acarreos.concepto_flete=conceptos.conceptos_id OR materiales.concepto = conceptos.conceptos_id ORDER BY acarreos.acarreo_id ASC';
    db.query(listaAcarreos, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

module.exports = router;
