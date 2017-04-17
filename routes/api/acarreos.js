var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var db = require('../../db.js');

//agregar acarreo
router.post('/', function(req,res, next){
console.log(req.body)
var recibo;
var usuario_id = req.user.id_usuario;
var obra_id = req.user.obra_id;
var camion_id= Number(req.body.camion_id);
var foto = req.body.photo;
if(!foto){
  foto = null;
}
var total_flete = req.body.precio_flete;
var zona_id = Number(req.body.zona_id);
var cantidad=req.body.capacidad;
var date= Date.now();
var flete_id = req.body.flete_id;
var banco_id = req.body.banco_id;
var hora = moment(date).format("YYYY-MM-DD HH:mm");
  if(req.body.material_id){
    var material_id= Number(req.body.material_id);
    var total_material = req.body.precio_material;
    var concepto_material = req.body.concepto_material;
  }
var concepto_flete = Number(req.body.concepto_flete);
      var nuevoRecibo = "INSERT INTO recibos(usuario_id,zona_id,foto,hora,obra_id,camion_id) VALUE (?,?,?,?,?,?);";
      db.query(nuevoRecibo,[usuario_id,zona_id,foto,hora,obra_id,camion_id], function(err, rows){
        console.log(nuevoRecibo)
        if(err) throw err;
        else {
            recibo=rows.insertId;
              if(concepto_flete == 100){
                  concepto_flete = 92;
                  var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id) VALUE (?,?,?,?,?,?);INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id) VALUE (?,?,?,?,?);'
                  var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,material_id,cantidad,total_material,concepto_material,recibo];
              } else {
                  var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id) VALUE (?,?,?,?,?,?);'
                  var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id];
              }
              console.log(values);
              db.query(nuevoAcarreo,values,function(err, rows){
                if(err) throw err;
                else {
                    res.redirect('/recibo/'+recibo)
                }
              });
        }
      });
})


//Read acarreos
router.get('/', function(err,res){
  var listaAcarreos = 'SELECT recibos.recibo_id,recibos.hora,recibos.foto, acarreos.estimacion,acarreos.acarreo_id,acarreos.categoria,proveedores.razon_social, conceptos.nombre_concepto,zonas.nombre_zona FROM acarreos JOIN recibos ON recibos.recibo_id = acarreos.recibo_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN proveedores ON camiones.proveedor_id = proveedores.id OR materiales.proveedor_id = proveedores.id LEFT JOIN conceptos ON acarreos.concepto_flete=conceptos.conceptos_id OR materiales.concepto = conceptos.conceptos_id ORDER BY acarreos.acarreo_id ASC';
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
var listaAcarreos = 'SELECT recibos.recibo_id,recibos.hora,recibos.foto, acarreos.estimacion,acarreos.acarreo_id,acarreos.categoria,proveedores.razon_social, conceptos.nombre_concepto,zonas.nombre_zona FROM acarreos JOIN recibos ON recibos.recibo_id = acarreos.recibo_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN proveedores ON camiones.proveedor_id = proveedores.id OR materiales.proveedor_id = proveedores.id LEFT JOIN conceptos ON acarreos.concepto_flete=conceptos.conceptos_id OR materiales.concepto = conceptos.conceptos_id WHERE recibos.obra_id = ? ORDER BY acarreos.acarreo_id ASC';

    db.query(listaAcarreos,[obra_id],function(err, rows){
    if(err){
      return console.log (err)
    } else {
      console.log(rows[rows.length-2])
        return res.send(rows);
    }
  });
})


router.post('/buscar', function(req,res,next){
  var proveedor_id = req.body.proveedor_id;
  var categoria = req.body.categoria;
  var date1 = moment(req.body.date1).format("YYYY-MM-DD HH:mm");
  var date2 = moment(req.body.date2).format("YYYY-MM-DD HH:mm");
  if(req.user.categoria === "administrador"){
    var obra_id = req.body.obra_id;
  } else {
      var obra_id = req.user.obra_id;
  }
  var categoriaProveedor;
  if (categoria === "material"){
    categoriaProveedor = "materiales";
  } else if (categoria === "flete"){
    categoriaProveedor = "camiones"
  }
  var listaAcarreosBuscar = 'SELECT acarreos.acarreo_id, acarreos.cantidad,acarreos.total, recibos.hora,recibos.foto, conceptos.nombre_concepto,zonas.nombre_zona,materiales.precio FROM acarreos LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN recibos ON acarreos.recibo_id = recibos.recibo_id LEFT JOIN obras ON recibos.obra_id = obras.obra_id LEFT JOIN materiales ON acarreos.material_id = materiales.id LEFT JOIN conceptos ON materiales.concepto = conceptos.conceptos_id OR conceptos.conceptos_id = acarreos.concepto_flete LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id WHERE acarreos.categoria = "'+categoria+'" AND recibos.obra_id = '+obra_id+' AND '+categoriaProveedor+'.proveedor_id = '+proveedor_id+' AND recibos.hora BETWEEN "'+date1+'" AND "'+date2+'" AND estimacion = "N";';
  console.log(listaAcarreosBuscar)
    db.query(listaAcarreosBuscar, function(err, acarreos){
      console.log(acarreos)
    if (!acarreos){
      console.log('no se encontraron acarreos')
          var message = "No se encontraron acarreos sin estimación en éstas fechas."
            res.send({message: message});
    }
    else if (acarreos.length > 0){
            res.send({acarreos: acarreos, message:message});
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

router.get('/semana', function(req, res, next ){
  if(req.user.categoria === "residente"){
    var obra_id = res.user.obra_id;
    var obra_query = 'recibos.obra_id ='+obra_id+' ';
  }
  var startOfWeek = moment().startOf('week').toDate();
  var endOfWeek   = moment().endOf('week').toDate();
  var getAcarreo = 'SELECT acarreos.acarreo_id, acarreos.cantidad,acarreos.total, recibos.hora,recibos.foto, conceptos.nombre_concepto,zonas.nombre_zona,materiales.precio FROM acarreos LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN recibos ON acarreos.recibo_id = recibos.recibo_id LEFT JOIN obras ON recibos.obra_id = obras.obra_id LEFT JOIN materiales ON acarreos.material_id = materiales.id OR acarreos.concepto_flete = materiales.id LEFT JOIN conceptos ON materiales.concepto = conceptos.conceptos_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id WHERE '+obra_query+' AND recibos.hora BETWEEN "'+date1+'" AND "'+date2+'" AND estimacion = "N";';
  db.query(getAcarreo, function(err, acarreo){
    if(err) throw err;
    else {
      if(acarreo.length > 0){
        console.log('Buscando acarreo por id');
        res.send(acarreo)
      } else {
        res.send('No hay acarreos sin estimación de esta semana.')
      }
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

router.get('/totales/:obra', function(req, res, next ){
  var obra= req.params.obra;
  var getAcarreoTotales = 'SELECT conceptos.nombre_concepto, sum(total) AS total_concepto, sum(cantidad) AS total_cantidad FROM acarreos LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN recibos ON acarreos.recibo_id = recibos.recibo_id JOIN conceptos ON concepto_flete = conceptos.conceptos_id OR conceptos.conceptos_id = materiales.concepto WHERE recibos.obra_id = ? GROUP BY concepto_flete, material_id;'
  db.query(getAcarreoTotales,[obra], function(err, totales){
    if(err) throw err;
    else {
        console.log('Buscando presupuesto');
        res.json(totales)
    }
  });
})



module.exports = router;
