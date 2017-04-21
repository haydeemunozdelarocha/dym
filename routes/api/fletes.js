var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

router.post('/', function(req,res,err){
  console.log(req.body)
  var obra_id = req.body.obra_id;
  var proveedor_id = req.body.proveedor_id;
  var precio = Number(req.body.precio);
  console.log(precio)
  var banco = req.body.banco;
  var unidad = req.body.unidad;
  var postFlete = 'INSERT INTO fletes(obra_id,proveedor_id,precio,unidad,banco) VALUE(?,?,?,?,?)';
    db.query(postFlete,[obra_id,proveedor_id,precio,unidad,banco], function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.post('/precio', function(req,res,err){
  var obra_id = req.user.obra_id;
  var proveedor_id = req.body.proveedor_id;
  var banco_id = req.body.banco_id;

    var getPrecio = 'SELECT * FROM fletes WHERE proveedor_id = ? AND obra_id = ? AND banco = ?';
    db.query(getPrecio,[proveedor_id,obra_id,banco_id],function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.get('/:proveedorid/:obraid', function(req,res,err){
  console.log('getting')
  var id = Number(req.params.proveedorid);
  var obra_id = req.params.obraid;
  var listaFletesProveedor = 'SELECT a.*, bp.razon_social AS nombre_banco, a.proveedor_id, bc.razon_social AS nombre_proveedor FROM fletes AS a LEFT JOIN proveedores AS bp ON bp.id = a.banco LEFT JOIN proveedores AS bc ON bc.id = a.proveedor_id WHERE a.proveedor_id = ? AND a.obra_id = ?';

    db.query(listaFletesProveedor,[id, obra_id], function(err, rows){
      console.log(listaFletesProveedor)
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

router.use(bodyParser.urlencoded({extended:true}))
router.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

  //Update a record.
router.put('/:idfletes', function(req,res,err){
  var id=req.params.idfletes;
  id= Number(id);
  var precio1 = req.body.precio1;
  var precio2 = req.body.precio2;
  var editarFletes = 'UPDATE `fletes` SET `precio1` = ?, `precio2` = ? WHERE `fletes_id`= ?';
    db.query(editarFletes,[precio1,precio2,id], function(err, flete){
        console.log(editarFlete);
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/fletes');
    }
  });
})

router.delete('/borrar/:id', function(req,res,err){
  var flete_id = req.params.id;
  console.log(flete_id)
  var borrarFletes = 'DELETE FROM fletes WHERE fletes_id = ?';
  db.query(borrarFletes,[flete_id], function(err,flete){
    if(err) throw err;
    else {
        console.log('Flete eliminado');
        res.send(flete)
    }
  });
})

module.exports = router;
