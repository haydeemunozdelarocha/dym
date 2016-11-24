var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var db = require('../../db.js');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var nuevoAcarreo = 'INSERT INTO acarreos(material_id,cantidad,camion_id,total_material,total_flete,hora,foto,checador_id,zona_id) VALUE(?,?,?,?,?,?,?,?,?)';
var listaAcarreos = 'SELECT acarreos.*, camiones.capacidad, proveedores.razon_social, materiales.nombre, materiales.precio FROM acarreos JOIN camiones ON camiones.camion_id = acarreos.flete JOIN proveedores ON proveedores.id = camiones.fletero JOIN materiales ON materiales.id = acarreos.material';



//agregar camion
router.post('/', function(req,res, next){
  console.log('posting')
  console.log(req.user)
var checador_id= Number(req.user.idusers);
var numero= req.body.numero;
var precio = req.body.precio;
var foto = req.body.photo;
var zona_id = Number(req.body.zona);
var material_id= Number(req.body.material_id);
var cantidad;
var date= Date.now();
var hora = moment(date).format("DD/MM/YYYY HH:mm A");
var getCamion = 'SELECT * FROM `camiones` WHERE `numero` = ' + numero ;
  db.query(getCamion, function(err,camion){
      if(err) throw err;
      else {
          var camion_id = Number(camion[0].camion_id);
          var precioFlete = camion[0].precio_flete;
          cantidad = camion[0].capacidad;
          var total_material = cantidad*precio;
          total_material = total_material.toString();
          var total_flete = cantidad*precioFlete;
          total_flete = total_flete.toString();
          console.log(material_id,cantidad,camion_id,total_material,total_flete,hora,foto,checador_id,zona_id)
            db.query(nuevoAcarreo,[material_id,cantidad,camion_id,total_material,total_flete,hora,foto,checador_id,zona_id], function(err,acarreo){
            if(err) throw err;
            else {
              console.log(acarreo)
                  var findLast = 'SELECT * FROM acarreos ORDER BY acarreo_id DESC LIMIT 1';
                  db.query(findLast, function(err, rows){
                      if(err) throw err;
                      else {
                        res.redirect('/recibo/'+rows[0].acarreo_id)
                        console.log(rows[0].acarreo_id)
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

router.get('/flete/:proveedorid/:date1/:date2', function(req,res,next){
  var proveedor_id = req.params.proveedorid;
  var date1 = moment(req.params.date1).format("DD/MM/YYYY HH:mm A");
  var date2 = moment(req.params.date2).format("DD/MM/YYYY HH:mm A");
  var listaAcarreosFlete = 'SELECT acarreos.*, camiones.* FROM acarreos JOIN camiones ON acarreos.camion_id = camiones.camion_id WHERE camiones.fletero = '+proveedor_id+' AND hora BETWEEN "'+date1+'" AND "'+date2+'"';

    db.query(listaAcarreosFlete,function(err, rows){
    if(err) throw err;
    else {
      console.log(listaAcarreosFlete)
        res.send(rows);
    }
  });
})

router.post('/buscar', function(req,res,next){
  var proveedor_id = req.body.proveedor_id;
  var date1 = moment(req.body.date1).format("DD/MM/YYYY HH:mm A");
  var date2 = moment(req.body.date2).format("DD/MM/YYYY HH:mm A");
  var listaAcarreosMaterial = 'SELECT acarreos.*, camiones.* FROM acarreos JOIN camiones ON acarreos.camion_id = camiones.camion_id WHERE camiones.fletero = '+proveedor_id+' AND hora BETWEEN "'+date1+'" AND "'+date2+'"';

    db.query(listaAcarreosMaterial,[proveedor_id], function(err, acarreos){
    if(err) throw err;
    else {
      console.log(date1)
        res.render('nuevaestimacion', { title: 'Nueva Estimación', acarreos: acarreos, date1: date1, date2:date2, proveedor:proveedor_id });
    }
  });
})

router.get('/:id', function(req, res, next ){
  var id= req.params.id;
  var getAcarreo = "SELECT * FROM `acarreos` WHERE `acarreo_id` = "+id;
  db.query(getAcarreo, function(err, acarreo){
    if(err) throw err;
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
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

router.put('/:idproveedor', function(req,res,err){
  var id= req.params.idproveedor;
  var razon_social = req.body.razon_social;
  var rfc = req.body.rfc;
  var direccion = req.body.direccion;
  var telefono = req.body.telefono;
  var ciudad = req.body.ciudad;
  var estado = req.body.estado;
  var editarProveedor = 'UPDATE proveedores SET razon_social = ?,rfc = ?, direccion = ?, telefono = ?, ciudad = ?, estado = ? WHERE id=?';

    db.query(editarProveedor,[razon_social,rfc,direccion,telefono,ciudad,estado,id], function(err, proveedor){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/proveedores')
    }
  });
})


  //Delete a record.
router.delete('/:id', function(req, err,res){
  var id=req.params.id;
  var borrarAcarreo = 'DELETE FROM acarreos WHERE acarreo_id='+id;
  db.query(borrarAcarreo, function(err, res){
    if(err) throw err;
    else {
        console.log('El acarreo ha sido eliminado');
    }
  });
})


module.exports = router;
