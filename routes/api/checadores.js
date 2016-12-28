var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

var listaChecadores = 'SELECT usuarios.*, obras.nombre_obra FROM usuarios LEFT JOIN obras ON usuarios.obra_id = obras.obra_id';
var getChecador = "SELECT * FROM `usuarios` WHERE `id_checador` = ?";
var editarChecador = 'UPDATE usuarios SET username = ?, password = ?, accessToken = ?, empleado_id = ?, obra_id = ? WHERE id_usuario= ?';

//Read table.
router.get('/', function(err,res){
    db.query(listaChecadores, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/:id', function(req, res, next ){
  var id_usuario= req.params.id;
  db.query(getChecador,[id_usuario], function(err, checador){
    if(err) throw err;
    else {
        console.log('Buscando checador por id');
        res.send(checador)
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
router.put('/editar/:id', function(req,res,err){
var id_checador = req.params.id;
var username= req.body.username;
var password= req.body.password;
var accessToken= req.body.accessToken;
var empleado_id= req.body.empleado_id;
var obra_id= req.body.obra_id;
    db.query(editarChecador,[username,password, accessToken, empleado_id, obra_id], function(err, checador){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/checadores')
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
router.delete('/borrar/:id', function(req,res,err){
  var id_checador = req.params.id;
  var borrarChecador = 'DELETE FROM checadores WHERE id_checador = ?';
  db.query(borrarChecador,[id_checador], function(err,checador){
    if(err) throw err;
    else {
        console.log('Este checador ha sido eliminada');
        res.redirect('/checadores');
    }
  });
})

module.exports = router;
