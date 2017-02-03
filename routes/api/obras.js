var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

var listaObras = 'SELECT obras.*, empleados.nombre FROM obras LEFT JOIN empleados ON empleados.id = obras.residente_id';
 var editarObra = 'UPDATE obras SET codigo = ?, nombre_obra = ?, residente_id = ?, ciudad = ?, estado=? WHERE obra_id=?';
var getObra = "SELECT * FROM `obras` WHERE `obra_id` = ?";

//agregar obra
router.post('/', function(req,res, next){
var nombre_obra= req.body.nombre;
var residente_id= req.body.residente_id;
var ciudad= req.body.ciudad;
var estado= req.body.estado;
var codigo= req.body.codigo;
var nuevaObra = 'INSERT INTO obras(nombre_obra,codigo,residente_id,ciudad,estado) VALUE(?,?,?,?,?)';
  db.query(nuevaObra,[nombre_obra,codigo,residente_id,ciudad,estado], function(err,obra){
      if(err) throw err;
      else {
          console.log('Nueva obra agregada exitosamente');
          res.redirect('/obras')
      }
    });
})

//Read table.
router.get('/', function(err,res){
    db.query(listaObras, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/:id', function(req, res, next ){
  var id= req.params.id;
  db.query(getObra, function(err, obra){
    if(err) throw err;
    else {
        console.log('Buscando obra por id');
        res.send(obra)
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
router.put('/:id', function(req,res,err){
  var obra_id= req.params.id;
  var nombre_obra = req.body.nombre;
  var codigo = req.body.codigo;
  var residente_id = req.body.residente_id;
  var ciudad = req.body.ciudad;
  var estado = req.body.estado;
    db.query(editarObra,[codigo,nombre_obra,residente_id,ciudad,estado,obra_id], function(err, obra){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/obras');
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
router.delete('/borrar/:idobra', function(req,res,err){
  var obra_id = req.params.idobra;
  var borrarObra = 'DELETE FROM obras WHERE obra_id = ?';
  console.log(req.params.idobra)
  db.query(borrarObra,[obra_id], function(err,obra){
    if(err) throw err;
    else {
        console.log('Esta obra ha sido eliminada');
        res.redirect('/obras');
    }
  });
})

module.exports = router;

