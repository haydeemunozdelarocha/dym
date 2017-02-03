var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var db = require('../../db.js');

var nuevoAcarreoFlete = 'INSERT INTO acarreos(cantidad,camion_id,total,categoria,recibo_id,concepto_flete) VALUE(?,?,?,?,?,?)';
var nuevoAcarreoMaterial = 'INSERT INTO acarreos(material_id,cantidad,total,categoria,recibo_id) VALUE(?,?,?,?,?)';
var listaAcarreos = 'SELECT acarreos.*, camiones.capacidad, proveedores.razon_social, materiales.concepto, materiales.precio FROM acarreos LEFT JOIN camiones ON camiones.camion_id = acarreos.camion_id LEFT JOIN proveedores ON proveedores.id = camiones.proveedor_id LEFT JOIN materiales ON materiales.id = acarreos.material_id';
var nuevoRecibo = 'INSERT INTO recibos(usuario_id,zona_id,foto,hora,obra_id) VALUE (?,?,?,?,?)';

//agregar acarreo
router.post('/', function(req,res, next){
console.log(req.body)
var recibo;
var usuario_id= Number(req.user.id_usuario);
var obra_id = Number(req.user.obra_id);
var numero= req.body.numero;
var foto = req.body.photo;
var concepto_flete = req.body.concepto_flete;
var zona_id = Number(req.body.zona_id);
var material_id= Number(req.body.material_id);
var cantidad;
var date= Date.now();
var hora = moment(date).format("YYYY-MM-DD HH:mm");
var getCamion = 'SELECT * FROM `camiones` WHERE `numero` = ' + numero ;
console.log(usuario_id,zona_id,foto,hora,obra_id)
  db.query(nuevoRecibo,[usuario_id,zona_id,foto,hora,obra_id], function(err,recibo){
      if(err) throw err;
      else {
        console.log(nuevoRecibo)
        var findLast = 'SELECT * FROM recibos ORDER BY recibo_id DESC LIMIT 1';
          db.query(findLast, function(err, rows){
          if(err) throw err;
          else {
            console.log(findLast)
            recibo = rows[0].recibo_id;
            db.query(getCamion, function(err,camion){
            if(err) throw err;
            else {
              console.log(getCamion)
                var camion_id = Number(camion[0].camion_id);
                var precioFlete = camion[0].precio_flete;
                cantidad = camion[0].capacidad;
                var total = cantidad*precioFlete;
                var recibo_id= recibo;
                categoria = "flete";
                  db.query(nuevoAcarreoFlete,[cantidad,camion_id,total,categoria,recibo_id,concepto_flete], function(err,acarreo){
                  if(err) throw err;
                  else {
                    console.log(nuevoAcarreoFlete)
                    var getMaterial = 'SELECT * FROM `materiales` WHERE `id` = ' + material_id ;
                      db.query(getMaterial, function(err,material){
                      if(err) throw err;
                      else {
                          var precio = material[0].precio;
                          var total = cantidad*precio;
                          var recibo_id= recibo;
                          categoria = "material";
                            db.query(nuevoAcarreoMaterial,[material_id,cantidad,total,categoria,recibo_id], function(err,acarreo){
                            if(err) throw err;
                            else {
                              console.log(acarreo)
                              console.log(recibo)
                              res.json({recibo:recibo})
                            }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        })
      }
    })
})

//Read acarreos
router.get('/', function(err,res){
    db.query(listaAcarreos, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/obra/:obraid', function(req,res,err){
  console.log('getting acarreos por obra')
var obra_id = req.params.obraid;
var listaAcarreos = 'SELECT recibos.*, acarreos.*,camiones.*,materiales.*,proveedores.razon_social, conceptos.nombre_concepto FROM recibos JOIN acarreos ON recibos.recibo_id = acarreos.recibo_id LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN proveedores ON camiones.proveedor_id = proveedores.id OR materiales.proveedor_id = proveedores.id JOIN conceptos ON acarreos.concepto_flete=conceptos.conceptos_id OR materiales.concepto = conceptos.conceptos_id WHERE recibos.obra_id = ? ORDER BY acarreos.acarreo_id ASC';
;

    db.query(listaAcarreos,[obra_id],function(err, rows){
    if(err){
      return console.log (err)
    } else {
        return res.send(rows);
    }
  });
})

router.post('/buscar', function(req,res,next){
  var proveedor_id = req.body.proveedor_id;
  var categoria = req.body.categoria;
  var date1 = moment(req.body.date1).format("YYYY-MM-DD HH:mm");
  var date2 = moment(req.body.date2).format("YYYY-MM-DD HH:mm");
  var obra_id = req.user.obra_id;
  var categoriaProveedor;
  if (categoria === "material"){
    categoriaProveedor = "materiales";
  } else if (categoria === "flete"){
    categoriaProveedor = "camiones"
  }
  var listaAcarreosBuscar = 'SELECT acarreos.*, camiones.*, recibos.*, materiales.*, conceptos.*,zonas.*,obras.nombre_obra, proveedores.razon_social FROM acarreos LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN recibos ON acarreos.recibo_id = recibos.recibo_id LEFT JOIN obras ON recibos.obra_id = obras.obra_id LEFT JOIN materiales ON acarreos.material_id = materiales.id LEFT JOIN conceptos ON materiales.concepto = conceptos.conceptos_id OR acarreos.concepto_flete = conceptos.conceptos_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN proveedores ON '+categoriaProveedor+'.proveedor_id = proveedores.id WHERE categoria = "'+categoria+'" AND recibos.obra_id = '+obra_id+' AND '+categoriaProveedor+'.proveedor_id = '+proveedor_id+' AND recibos.hora BETWEEN "'+date1+'" AND "'+date2+'" AND estimacion = "N";';
    db.query(listaAcarreosBuscar, function(err, acarreos){
      console.log(acarreos)
    if (acarreos.length === 0){
      console.log('no se encontraron acarreos')
          var message = "No se encontraron acarreos sin estimación en éstas fechas."
            res.render('error',{message: message});
    }
    else if (acarreos.length > 0){
          var ids = [];
          for (var i = 0 ; i < acarreos.length ; i++){
            ids.push(acarreos[i].acarreo_id)
          }
          console.log(ids)
          date1 = moment(date1).format("YYYY-MM-DD HH:mm");
          date2 = moment(date2).format("YYYY-MM-DD HH:mm");
          var message = ""
            res.render('nuevaestimacion', { title: 'Nueva Estimación', acarreos: acarreos, date1: date1, date2:date2, proveedor:proveedor_id, categoria: categoria, obra: obra_id, ids: ids , message:message});
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


  //Delete a record.
router.delete('/:id', function(req, err,res){
  var id=req.params.id;
  var borrarAcarreo = 'DELETE FROM acarreos WHERE acarreo_id='+id;
  db.query(borrarAcarreo, function(err, res){
    if(err) throw err;
    else {
        res.redirect('/residentes/estimaciones');
    }
  });
})


module.exports = router;
