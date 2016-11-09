var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var db = require('../../db.js');

var nuevoAcarreo = 'INSERT INTO acarreos(camion_id, material_id,hora,zona) VALUE(?,?,?,?)';
var listaAcarreos = 'SELECT acarreos.*, camiones.capacidad, proveedores.razon_social, materiales.nombre, materiales.precio FROM acarreos JOIN camiones ON camiones.id = acarreos.camion_id JOIN proveedores ON proveedores.id = camiones.proveedor_id JOIN materiales ON materiales.id = acarreos.material_id';



//agregar camion
router.post('/', function(req,res, next){
  console.log('posting')
var numero= req.body.numero;
var precio = req.body.precio;
var zona = req.body.zona;
var material_id= Number(req.body.material_id);
var capacidad;
var date= Date.now();
var hora = moment(date).format("DD/MM/YYYY HH:mm A");
var getCamion = "SELECT * FROM `camiones` WHERE `numero` =" + numero+"";
console.log(getCamion);
  db.query(getCamion, function(err,camion){
      if(err) throw err;
      else {
          var camion_id = camion[0].id;
          capacidad = camion[0].capacidad;
            db.query(nuevoAcarreo,[camion_id,material_id,hora,zona], function(err,acarreo){
            if(err) throw err;
            else {
                  var findLast = 'SELECT * FROM acarreos ORDER BY id DESC LIMIT 1';
                  db.query(findLast, function(err, rows){
                      if(err) throw err;
                      else {
                        res.redirect('/recibo/'+rows[0].id)
                        console.log(rows[0].id)
                      }
                    });
              console.log(acarreo)
            }
    });
      }
    });
})

//Read table.
router.get('/', function(err,res){
    db.query(listaAcarreos, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/:id', function(req, res, next ){
  var id= req.params.id;
  var getAcarreo = "SELECT * FROM `acarreos` WHERE `id` = "+id;
  db.query(getAcarreo, function(err, acarreo){
    if(err) throw err;
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

  //Delete a record.
router.delete('/:id', function(req, err,res){
  var id=req.params.id;
  var borrarAcarreo = 'DELETE FROM acarreos WHERE id='+id;
  db.query(borrarAcarreo, function(err, res){
    if(err) throw err;
    else {
        console.log('El acarreo ha sido eliminado');
    }
  });
})


module.exports = router;
