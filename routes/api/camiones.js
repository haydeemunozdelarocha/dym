var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

var nuevoCamion = 'INSERT INTO camiones(modelo, numero, placas, proveedor_id, capacidad) VALUE(?,?,?,?,?)';
var listaCamiones = 'SELECT proveedores.nombre, camiones.* FROM camiones INNER JOIN proveedores ON camiones.proveedor_id=proveedores.id';
var getCamion = "SELECT * FROM `camiones` WHERE `numero` = ?";
var editarCamion = 'UPDATE camiones SET modelo = ?, placas = ?, proveedor_id = ?, capacidad= ?, numero= ? WHERE id= ?';

//Read table.
router.get('/', function(err,res){
    db.query(listaCamiones, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/buscar/:id', function(req, res, next ){
  var numero= req.params.id;
  db.query(getCamion,[numero], function(err, camion){
    if(err) throw err;
    else {
        console.log('Buscando camion por id');
        res.send(camion)
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

router.post('/', function(req,res,err){
var numero = req.body.numero;
var modelo= req.body.modelo;
var placas= req.body.placas;
var proveedor_id= req.body.proveedor_id;
var capacidad= req.body.capacidad;
    db.query(nuevoCamion,[modelo,numero,placas,proveedor_id,capacidad], function(err, camion){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/camiones')
    }
  });
})

  //Update a record.
router.put('/:idcamion', function(req,res,err){
var id = req.params.idcamion;
var modelo= req.body.modelo;
var placas= req.body.placas;
var numero= req.body.numero;
var proveedor_id= req.body.proveedor_id;
var capacidad= req.body.capacidad;
    db.query(editarCamion,[modelo,placas,proveedor_id,capacidad,numero,id], function(err, camion){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/camiones')
    }
  });
})



router.use( function( req, res, next ) {
    // this middleware will call for each requested
    // and we checked for the requested query properties
    // if _method was existed
    // then we know, clients need to call DELETE request instead
    if ( req.query._method == 'DELETE' ) {
        // change the original METHOD
        // into DELETE method
        req.method = 'DELETE';
        // and set requested url to /user/12
        req.url = req.path;
    }
    next();
});

  //Delete a record.
router.delete('/borrar/:idcamion', function(req,res,err){
  var id = req.params.idcamion;
  var borrarCamion = 'DELETE FROM camiones WHERE id = ?';
  console.log(req.params.idcamion)
  db.query(borrarCamion,[id], function(err,camion){
    if(err) throw err;
    else {
        console.log('Este camion ha sido eliminada');
        res.redirect('/camiones');
    }
  });
})

module.exports = router;
