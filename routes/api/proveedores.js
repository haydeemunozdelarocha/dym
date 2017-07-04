var express = require('express');
var router = express.Router();
var db = require('../../db.js');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var nuevoProveedor = 'INSERT INTO proveedores(razon_social,direccion,telefono,ciudad,estado,rfc,retencion,categoria) VALUE(?,?,?,?,?,?,?,?)';
var listaProveedores = 'SELECT * FROM proveedores';
var editarProveedor = 'UPDATE proveedores SET razon_social = ?,rfc = ?, direccion = ?, telefono = ?, ciudad = ?, estado = ?,categoria=?,retencion=? WHERE id=?';
var getProveedor = "SELECT * FROM `proveedores` WHERE `id` = ?";

//add obra
router.post('/', function(req,res, next){
var razon_social= req.body.razon_social;
var direccion= req.body.direccion;
var telefono= req.body.telefono;
var ciudad= req.body.ciudad;
var estado= req.body.estado;
var rfc= req.body.rfc;
var categoria= req.body.categoria;

if(req.body.retencion){
  var retencion = req.body.retencion;
} else {
  var retencion = 'Y';
}
  db.query(nuevoProveedor,[razon_social, direccion, telefono,ciudad,estado,rfc,retencion,categoria], function(err,proveedor){
      if(err){
        res.render('error',{message: 'Hubo un error al guardar la entrada de proveedor nuevo. Por favor inténtelo de nuevo.', usuario:usuario })
      }
      else {
          console.log('Nuevo proveedor agregado exitosamente');
          res.redirect('/proveedores');
      }
    });
})

//Read table.
router.get('/', function(err,res){
    db.query(listaProveedores, function(err, rows){
    if(err){
      res.send({message: 'Esta página no esta disponible'})
    }
    else {
        res.send(rows);
    }
  });
})

router.get('/:id', function(req, res, next ){
  var id= req.params.id;
  db.query(getProveedor, function(err, proveedor){
    if(err){
      res.send({message: 'Esta página no esta disponible' })

    }
    else {
        console.log('Buscando proveedor por id');
        res.send(proveedor)
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
router.put('/:idproveedor', function(req,res,err){
  var id= req.params.idproveedor;
  var razon_social = req.body.razon_social;
  var rfc = req.body.rfc;
  var direccion = req.body.direccion;
  var telefono = req.body.telefono;
  var ciudad = req.body.ciudad;
  var estado = req.body.estado;
    var retencion = req.body.retencion;
    var categoria = req.body.categoria;
    db.query(editarProveedor,[razon_social,rfc,direccion,telefono,ciudad,estado,categoria,retencion,id], function(err, proveedor){
    if(err) {
            res.send({message: 'No se pudo editar el proveedor seleccionado.'})
    }
    else {
        console.log('Listo');
        res.redirect('/proveedores')
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
router.delete('/borrar/:idproveedor', function(req,res,err){
  var id = req.params.idproveedor;
  var borrarProveedor = 'DELETE FROM proveedores WHERE id = ?';
 db.query(borrarProveedor,[id], function(err,proveedor){
    if(err){
      console.log(err.code);
      res.send({message: 'No se pudo eliminar el proveedor seleccionado. Por favor inténtelo de nuevo.'})
    }
    else {
        console.log('Este proveedor ha sido eliminada');
        res.redirect('/proveedores');
    }
  });
})

module.exports = router;



