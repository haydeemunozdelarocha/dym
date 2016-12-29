var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');
var moment= require('moment');

var nuevoEmpleado = 'INSERT INTO empleados(nombre,obra,puesto,fecha_nacimiento,fecha_contratacion,sueldo) VALUE(?,?,?,?,?,?)';
var listaEmpleados = 'SELECT empleados.*,obras.nombre_obra,usuarios.username FROM empleados LEFT JOIN obras ON empleados.obra = obras.obra_id LEFT JOIN usuarios ON empleados.id = usuarios.empleado_id';
var getEmpleado = "SELECT *, DATE_FORMAT(fecha_contratacion,'%Y-%m-%d') AS contratacion, DATE_FORMAT(fecha_nacimiento,'%Y-%m-%d') AS nacimiento FROM `empleados` WHERE `id` = ?";
var editarEmpleado = 'UPDATE empleados SET nombre = ?, obra = ?, puesto= ?, fecha_nacimiento= ?, fecha_contratacion = ?, sueldo = ? WHERE id= ?';

//Read table.
router.get('/', function(err,res){
    db.query(listaEmpleados, function(err, rows){
    if(err) throw err;
    else {
      console.log(rows)
        res.send(rows);
    }
  });
})

router.get('/obra/:obraid', function(req,res,err){
  console.log('getting empleados')
  var obra_id= req.params.obraid;
  console.log(obra_id)
  var listaEmpleados = 'SELECT empleados.*,obras.nombre_obra,usuarios.username FROM empleados LEFT JOIN obras ON empleados.obra = obras.obra_id LEFT JOIN usuarios ON empleados.id = usuarios.empleado_id WHERE obra = ?;';

    db.query(listaEmpleados,[obra_id], function(err, rows){
    if(err) throw err;
    else {
      console.log(rows)
        res.send(rows);
    }
  });
})

router.get('/:id', function(req, res, next ){
  var id= req.params.id;
  console.log('getting empleado')
  db.query(getEmpleado,[id], function(err, empleado){
    if(err) throw err;
    else {
        console.log('Buscando empleado por id');
        res.send(empleado)
    }
  });
})

router.post('/', function(req,res,err){
var nombre = req.body.nombre;
var obra= req.body.obra;
var puesto= req.body.puesto;
var fecha_nacimiento= moment(req.body.fecha_nacimiento).format("YYYY-MM-DD");
var fecha_contratacion= moment(req.body.fecha_contratacion).format("YYYY-MM-DD");
console.log(fecha_nacimiento)
console.log(fecha_contratacion)
var sueldo= req.body.sueldo;
    db.query(nuevoEmpleado,[nombre,obra,puesto,fecha_nacimiento,fecha_contratacion,sueldo], function(err, empleado){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/empleados')
    }
  });
})

router.use(bodyParser.urlencoded({extended:true}))
router.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    console.log(method);
    delete req.body._method
    console.log(method)
    return method
  }
}))

  //Update a record.
router.put('/:idempleado', function(req,res,err){
  console.log('updating')
var id = req.params.idempleado;
var nombre= req.body.nombre;
var obra= req.body.obra;
var puesto= req.body.puesto;
var fecha_nacimiento= moment(req.body.fecha_nacimiento).format("YYYY-MM-DD");
var fecha_contratacion= moment(req.body.fecha_contratacion).format("YYYY-MM-DD");
console.log(fecha_nacimiento)
console.log(fecha_contratacion)
var sueldo= req.body.sueldo;
    db.query(editarEmpleado,[nombre,obra,puesto,fecha_nacimiento,fecha_contratacion,sueldo,id], function(err, empleado){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/empleados')
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
router.delete('/borrar/:idempleado', function(req,res,err){
  console.log('borrar')
  var id = req.params.idempleado;
  var borrarEmpleado = 'DELETE FROM empleados WHERE id = ?';
  db.query(borrarEmpleado,[id], function(err,empleado){
    if(err) throw err;
    else {
        console.log('Este empleado ha sido eliminada');
        res.redirect('/empleados');
    }
  });
})

module.exports = router;
