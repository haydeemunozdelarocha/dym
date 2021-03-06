var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

var getCamion = "SELECT camiones.*, proveedores.categoria FROM `camiones` LEFT JOIN proveedores ON camiones.proveedor_id = proveedores.id WHERE `numero` = ?;";
var editarCamion = 'UPDATE camiones SET modelo = ?, placas = ?, capacidad= ?, numero= ?,categoria=? WHERE camion_id= ?';

//Read table.
router.get('/', function(err,res){
  var listaCamiones = 'SELECT proveedores.razon_social, camiones.* FROM camiones INNER JOIN proveedores ON camiones.proveedor_id=proveedores.id';

    db.query(listaCamiones, function(err, rows){
    if(err) {
      res.send({message:err})
    }
    else {
        res.send(rows);
    }
  });
})

router.get('/codigo/:sticker', function(req,res,err){
  var sticker=req.params.sticker;
  var getCodigo = 'SELECT * FROM stickers WHERE sticker_id = ?;';
  var checkAvailability='SELECT * FROM camiones WHERE numero = ?';
  var codigo;
    db.query(getCodigo,[sticker], function(err, rows){
    if(err) {
      res.send({message:err})
    }
    else {
      if(rows.length==0){
        res.send({message:'El número de sticker no se ha creado.'})
      } else {
          codigo = rows[0].codigo;
            db.query(checkAvailability,[codigo], function(err, rows){
              if(err) throw err;
              else {
                console.log(rows);
                if(rows.length==0){
                  res.json(codigo);
                } else {
                  res.send({message:'El número de sticker no está disponible.'})
                }
              }
            });
      }
    }
  });
})

router.get('/numero/:sticker', function(req,res,err){
  var sticker=req.params.sticker;
  var getCodigo = 'SELECT stickers.codigo,proveedores.categoria FROM stickers JOIN camiones ON camiones.numero = stickers.codigo JOIN proveedores ON camiones.proveedor_id = proveedores.id WHERE sticker_id = ?;';
  var codigo;
    db.query(getCodigo,[sticker], function(err, rows){
    if(err) {
      res.send({message: 'No se encontró el número de sticker', usuario:usuario })
    }
    else {
      if(rows.length==0){
        res.send({message:'El número de sticker no se ha creado.'})
      } else {
          res.json(rows[0]);
      }
    }
  });
})

router.get('/buscar/:id', function(req, res, next ){
  var numero= req.params.id;
  db.query(getCamion,[numero], function(err, camion){
    if(err){
      res.send({message: 'No se encontró el camión seleccionado.'})
    }
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
var categoria= req.body.categoria;
var unidad_camion= req.body.unidad;
var proveedor_id= req.body.proveedor_id;
var capacidad= req.body.capacidad;
var nuevoCamion = 'INSERT INTO camiones(modelo, numero, placas, proveedor_id, capacidad, unidad_camion,categoria) VALUE(?,?,?,?,?,?,?)';

    db.query(nuevoCamion,[modelo,numero,placas,proveedor_id,capacidad,unidad_camion,categoria], function(err, camion){
    if(err){
      res.render('error',{message: 'Hubo un error al guardar la entrada. Por favor inténtelo de nuevo.', usuario:usuario })
    }
    else {
        console.log('Listo');
        res.redirect('/camiones')
    }
  });
})

  //Update a record.
router.put('/:idcamion', function(req,res,err){
var camion_id = req.params.idcamion;
var modelo= req.body.modelo;
var placas= req.body.placas;
var numero= req.body.numero;
var categoria= req.body.categoria;
var capacidad= req.body.capacidad;
    db.query(editarCamion,[modelo,placas,capacidad,numero,categoria,camion_id], function(err, camion){
    if(err){
      res.render('error',{message: 'No se pudo editar el camión seleccionado. Por favor inténtelo de nuevo.', usuario:usuario })
    }
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
  var camion_id = req.params.idcamion;
  var borrarCamion = 'DELETE FROM camiones WHERE camion_id = ?';
  db.query(borrarCamion,[camion_id], function(err,camion){
    if(err) {
      res.render('error',{link: '/camiones',message:'No se eliminó el camión exitosamente. Por favor elimine los acarreos ligados a este camión.'});
    }
    else {
        console.log('Este camion ha sido eliminada');
        res.redirect('/camiones');
    }
  });
})

module.exports = router;
