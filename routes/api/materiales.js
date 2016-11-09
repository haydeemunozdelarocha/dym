var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

var nuevoMaterial = 'INSERT INTO materiales(nombre, unidad, precio,proveedor_id) VALUE(?,?,?,?)';
var listaMateriales = 'SELECT * FROM materiales';
var listaMaterialesProveedor = 'SELECT * FROM materiales WHERE proveedor_id = ?';
var editarMaterial = 'UPDATE `materiales` SET `nombre` = ?, `unidad` = ?, proveedor_id = ?, `precio` = ? WHERE `id`= ?';
var borrarMaterial = 'DELETE FROM materiales WHERE nombre=?';


//agregar material
router.post('/', function(req,res, next){
var nombre= req.body.nombre;
var unidad= req.body.unidad;
var precio= req.body.precio;
var proveedor_id = req.body.proveedor_id;
  db.query(nuevoMaterial,[nombre, unidad, precio,proveedor_id], function(err,material){
      if(err) throw err;
      else {
          console.log('Nuevo material agregado exitosamente');
          res.redirect('/materiales')
      }
    });
})

//Read table.
router.get('/', function(err,res){
    db.query(listaMateriales, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/:proveedorid', function(req,res,err){
  var id = req.params.proveedorid;
    db.query(listaMaterialesProveedor,[id], function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/material/:idmaterial', function(req, res, next ){
  console.log('getting')
  var id= req.params.idmaterial;
  console.log(id)
  var getMaterial = 'SELECT * FROM `materiales` WHERE `id` = '+id;

  db.query(getMaterial,function(err, material){
    if(err) throw err;
    else {
        console.log(material[0]);
        res.send(material[0])
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
router.put('/:idmaterial', function(req,res,err){
  var id=req.params.idmaterial;
  id= Number(id);
  var nombre = req.body.nombre;
  var unidad = req.body.unidad;
  var proveedor_id = req.body.proveedor_id;
  var precio = req.body.precio;
    db.query(editarMaterial,[nombre,unidad,proveedor_id,precio,id], function(err, material){
        console.log(editarMaterial);
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/materiales');
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
router.delete('/borrar/:idmaterial', function(req,res,err){
  var id = req.params.idmaterial;
  var borrarMaterial = 'DELETE FROM materiales WHERE id = ?';
  db.query(borrarMaterial,[id], function(err,material){
    if(err) throw err;
    else {
        console.log('Este material ha sido eliminado');
        res.redirect('/materiales');
    }
  });
})

module.exports = router;
