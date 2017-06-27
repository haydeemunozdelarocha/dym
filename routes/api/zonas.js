var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

var nuevaZona = 'INSERT INTO zonas(nombre_zona) VALUE(?)';
var listaZonas = 'SELECT * FROM zonas';
var borrarZona = 'DELETE FROM zonas WHERE zonas_id=?';

router.get('/lista/:concepto', function(req,res,err){
  console.log('getting zonas back')
  var obra_id = req.user.obra_id;
  var concepto = req.params.concepto;
  console.log(concepto)
  var listaZonas = 'SELECT presupuestos.zona,zonas.nombre_zona FROM presupuestos JOIN zonas ON presupuestos.zona = zonas.zonas_id WHERE obra = '+obra_id+' AND concepto = '+concepto+';'
    db.query(listaZonas, function(err, rows){
      console.log(listaZonas)
    if(err) {
      console.log(err)
    }
    else {
        res.json(rows);
    }
  });
})

//agregar material
router.post('/', function(req,res, next){
var nombre_zona= req.body.nombre_zona;
  db.query(nuevaZona,[nombre_zona], function(err,zona){
      if(err) throw err;
      else {
          res.send(zona);
      }
    });
})

//Read table.
router.get('/', function(err,res){
    db.query(listaZonas, function(err, rows){
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
router.delete('/borrar/:idzona', function(req,res,err){
  var zonas_id = req.params.idzona;
  var borrarZona = 'DELETE FROM zonas WHERE zonas_id = ?';
  db.query(borrarConcepto,[zonas_id], function(err,zona){
    if(err) throw err;
    else {
        res.send(zona);
    }
  });
})

module.exports = router;
