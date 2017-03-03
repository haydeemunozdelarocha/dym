var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

var nuevoConcepto = 'INSERT INTO conceptos(nombre_concepto) VALUE(?)';
var listaConceptos = 'SELECT * FROM conceptos';
var borrarConcepto = 'DELETE FROM conceptos WHERE conceptos_id=?';


//agregar material
router.post('/', function(req,res, next){
var nombre_concepto= req.body.nombre_concepto;
  db.query(nuevoConcepto,[nombre_concepto], function(err,concepto){
      if(err) throw err;
      else {
          res.send(concepto);
      }
    });
})

//Read table.
router.get('/', function(err,res){
    db.query(listaConceptos, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
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
router.delete('/borrar/:idconcepto', function(req,res,err){
  var conceptos_id = req.params.idconcepto;
  var borrarMaterial = 'DELETE FROM materiales WHERE id = ?';
  db.query(borrarConcepto,[conceptos_id], function(err,concepto){
    if(err) throw err;
    else {
        res.send(concepto);
    }
  });
})

module.exports = router;
