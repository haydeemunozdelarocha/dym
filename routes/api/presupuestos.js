var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');


var nuevoPresupuesto = 'INSERT INTO presupuestos(obra, concepto, cantidad, unidad,zona, precio_unitario, total) VALUE(?,?,?,?,?,?,?)';
var listaPresupuestos = 'SELECT presupuestos.*, conceptos.*, zonas.*, obras.* FROM presupuestos JOIN obras ON presupuestos.obra=obras.obra_id JOIN zonas ON presupuestos.zona = zonas.zonas_id JOIN conceptos ON presupuestos.concepto = conceptos.conceptos_id' ;
var editarPresupuesto = 'UPDATE presupuestos SET obra = ?, concepto = ?, cantidad= ?, zona= ?, precio_unitario = ?, total=? WHERE presupuesto_id= ?';
var getPresupuesto = 'SELECT * FROM presupuestos WHERE obra = ? AND concepto = ? AND zona = ?';

//Read table.
router.get('/', function(err,res){
    db.query(listaPresupuestos, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/buscar/:articulo', function(req, res, next ){
  console.log('filling out missing info articulo')
  var articulo_id = req.params.articulo;
  var esta_estimacion;
  var estimacion_id;
  var acumulado_actual;
  var presupuesto_id;
  var zona;
  var getArticulo = 'SELECT estimacion_articulo.*, estimaciones.obra FROM estimacion_articulo JOIN estimaciones ON estimacion_articulo.estimacion_id = estimaciones.estimaciones_id WHERE estimacion_articulo.articulo_id = ?;'
  var updateArticulo = 'UPDATE estimacion_articulo SET unidad = ?, cantidad_presupuestada = ?, acumulado_anterior = ?, acumulado_actual = ?, por_ejercer = ? WHERE articulo_id = ?;';
  var updatePresupuesto = 'UPDATE presupuestos SET acumulado = ? WHERE presupuestos_id = ?;';
  db.query(getArticulo,[articulo_id]).then(function(articulo,err){
    if(err) throw err
    else {
      var obra = articulo[0].obra;
      var concepto_id = articulo[0].concepto_id;
      esta_estimacion = Number(articulo[0].esta_estimacion);
      estimacion_id = articulo[0].estimacion_id;
      zona = articulo[0].zona_id;
      console.log(articulo[0])
      return db.query(getPresupuesto,[obra,concepto_id,zona])
    }
  }).then( function(presupuesto,err){
    if(err) throw err
    else {
      console.log(presupuesto[0])
      presupuesto_id = presupuesto[0].presupuestos_id;
      var unidad = presupuesto[0].unidad;
      var cantidad_presupuestada = presupuesto[0].cantidad;
      var acumulado_anterior = presupuesto[0].acumulado;
      acumulado_actual = presupuesto[0].acumulado + esta_estimacion;
      var por_ejercer = cantidad_presupuestada - acumulado_actual;
      return db.query(updateArticulo,[unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer,articulo_id,acumulado_actual,presupuesto_id]);
    }
  }).then(function(articulo,err){
          if(err) throw err
          else {
            return db.query(updatePresupuesto,[acumulado_actual,presupuesto_id])
          }
        }).then(function(presupuesto,err){
            console.log(acumulado_actual,presupuesto_id)
            res.json(estimacion_id)
        })
    })


router.get('/:obra', function(req, res, next ){
  var obra= req.params.obra;
  var concepto= req.params.concepto;
  var getPresupuesto = 'SELECT presupuestos.*,zonas.nombre_zona FROM presupuestos LEFT JOIN zonas ON presupuestos.zona = zonas.zonas_id WHERE obra = ? ';
  db.query(getPresupuesto,[obra], function(err, presupuesto){
    if(err) throw err;
    else {
        console.log('Buscando presupuesto');
        res.json(presupuesto)
    }
  });
})

router.get('/totales/:obra', function(req, res, next ){
  var obra= req.params.obra;
  var concepto= req.params.concepto;
  var getPresupuesto = 'SELECT presupuestos.obra,presupuestos.unidad, conceptos.nombre_concepto, sum(total) AS total_concepto, sum(cantidad) AS total_cantidad,sum(acumulado) AS total_acumulado FROM presupuestos JOIN conceptos ON presupuestos.concepto = conceptos.conceptos_id WHERE obra = ? GROUP BY nombre_concepto;';
  db.query(getPresupuesto,[obra], function(err, presupuesto){
    if(err) throw err;
    else {
        console.log('Buscando presupuesto');
        res.json(presupuesto)
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
var obra = req.body.obra;
var concepto= req.body.concepto;
var zona= req.body.zona;
var cantidad= req.body.cantidad;
var unidad= req.body.unidad;
var precio_unitario= req.body.precio_unitario;
var total= cantidad*precio_unitario;
console.log(obra,concepto,cantidad,unidad,zona,precio_unitario,total)
    db.query(nuevoPresupuesto,[obra,concepto,cantidad,unidad,zona,precio_unitario,total], function(err, presupuesto){
    if(err) throw err;
    else {
        console.log('Listo');
        res.send(presupuesto)
    }
  });
})

  //Update a record.
router.put('/:idpresupuesto', function(req,res,err){
var id = req.params.idpresupuesto;
var obra= req.body.obra;
var concepto= req.body.concepto;
var zona= req.body.zona;
var precio_unitario= req.body.precio_unitario;
var total= req.body.total;
    db.query(editarPresupuesto,[obra,concepto,cantidad,zona,precio_unitario,total,id], function(err, camion){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/presupuestos')
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
router.delete('/borrar/:idpresupuesto', function(req,res,err){
  var id = req.params.idpresupuesto;
  var borrarPresupuesto = 'DELETE FROM presupuestos WHERE presupuestos_id = ?';
  db.query(borrarPresupuesto,[id], function(err,presupuesto){
    if(err) throw err;
    else {
        console.log('Este presupuesto ha sido eliminada');
        res.redirect('/presupuestos');
    }
  });
})

module.exports = router;
