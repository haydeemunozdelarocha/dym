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
var concepto_flete = Number(req.body.concepto_flete);

  if(concepto_flete == 100){
    var material_id= Number(req.body.material_id);
    var total_material = (Number(req.body.precio_material)*cantidad);
    var concepto_material = req.body.concepto_material;
  } else if(concepto_flete == 92){
    var material_id= concepto_flete;
    var total_material = (Number(req.body.precio_material)*cantidad);
    var concepto_material = req.body.concepto_material;
  }
      var nuevoRecibo = "INSERT INTO recibos(usuario_id,zona_id,foto,hora,obra_id,camion_id) VALUE (?,?,?,?,?,?);";
      db.query(nuevoRecibo,[usuario_id,zona_id,foto,hora,obra_id,camion_id], function(err, rows){
        console.log(nuevoRecibo)
        if(err) throw err;
        else {
            recibo=rows.insertId;
              if(concepto_flete == 100 || concepto_flete == 92){
                  var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id) VALUE (?,?,?,?,?,?);INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id) VALUE (?,?,?,?,?,?);'
                  var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,material_id,cantidad,total_material,concepto_material,recibo,banco_id];
              } else {
                  var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id) VALUE (?,?,?,?,?,?);'
                  var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id];
              }
              console.log(values);
              db.query(nuevoAcarreo,values,function(err, rows){
                if(err) throw err;
                else {
                    res.redirect('/captura')
                }
              });
        }
      });
})


//Read acarreos


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
    listaAcarreosBuscar = 'SELECT acarreos_material.acarreos_mat_id, acarreos_material.cantidad,acarreos_material.total_material, recibos.hora,recibos.foto, conceptos.nombre_concepto,zonas.nombre_zona,materiales.precio,materiales.unidad FROM acarreos_material LEFT JOIN recibos ON acarreos_material.recibo_id = recibos.recibo_id LEFT JOIN obras ON recibos.obra_id = obras.obra_id LEFT JOIN materiales ON acarreos_material.material_id = materiales.id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id WHERE recibos.obra_id = '+obra_id+' AND acarreos_material.banco_id = '+proveedor_id+' AND recibos.hora BETWEEN "'+date1+'" AND "'+date2+'" AND estimacion = "N";';
  } else if (categoria === "flete"){
    listaAcarreosBuscar = 'SELECT acarreos_flete.acarreo_id, fletes.unidad,acarreos_flete.cantidad,acarreos_flete.total_flete,fletes.precio,proveedores.razon_social,fletes.proveedor_id, recibos.hora,recibos.foto, conceptos.nombre_concepto,zonas.nombre_zona FROM acarreos_flete LEFT JOIN recibos ON acarreos_flete.recibo_id = recibos.recibo_id LEFT JOIN obras ON recibos.obra_id = obras.obra_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id LEFT JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN proveedores ON proveedores.id = fletes.proveedor_id WHERE recibos.obra_id = '+obra_id+' AND fletes.proveedor_id = '+proveedor_id+' AND recibos.hora BETWEEN "'+date1+'" AND "'+date2+'" AND estimacion = "N";';
  }
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

router.get('/flete/:id', function(req, res, next ){
  var id= req.params.id;
  var getAcarreo = "SELECT * FROM `acarreos_flete` WHERE `acarreo_id` = "+id;
  db.query(getAcarreo, function(err, acarreo){
    if(err) throw err;
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

router.get('/recibos', function(req, res, next ){
  var getAcarreo = "SELECT * FROM `recibos` WHERE camion_id = 122";
  var acarre ='SELECT recibos.camion_id, acarreos_flete.* FROM recibos JOIN acarreos_flete ORDER BY recibos.camion_id'
  var deleteAcarreo ="DELETE FROM acarreos_flete WHERE recibo_id = null"
  db.query(acarre, function(err, acarreo){
    if(err) throw err;
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

router.get('/flete', function(req, res, next ){
  var getAcarreo = "SELECT * FROM `acarreos_flete`";
  db.query(getAcarreo, function(err, acarreo){
    if(err) throw err;
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

router.get('/material', function(req, res, next ){
  var getAcarreo = "SELECT * FROM `acarreos_material`";
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
router.delete('/flete/:id', function(req,res,err){
  var id=req.params.id;
  var borrarAcarreo = 'DELETE FROM acarreos_flete WHERE recibo_id='+id;
  db.query(borrarAcarreo, function(err, response){
    if(err) throw err;
    else {
        res.send('done');
    }
  });
})

router.delete('/recibo/:id', function(req,res,err){
  var id=req.params.id;
  var borrarAcarreo = 'DELETE FROM recibos WHERE recibo_id='+id;
  db.query(borrarAcarreo, function(err, response){
    if(err) throw err;
    else {
        res.send('done');
    }
  });
})

router.delete('/material/:id', function(req,res,err){
  var id=req.params.id;
  var borrarAcarreo = 'DELETE FROM acarreos_material WHERE recibo_id='+id;
  db.query(borrarAcarreo, function(err, response){
    if(err) throw err;
    else {
        res.send('done');
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

router.post('/recibos/resumen', function(req, res, next ){
  var date= Date.now();
  var hora = moment(date).format("YYYY-MM-DD");
  var hora_recibo = moment(date).format("YYYY-MM-DD HH:mm");
  var date1 = hora + " 00:00";
  var date2 = hora + " 23:59";
  var obra_id = req.user.obra_id;
  var numero = req.body.numero;
  console.log(date1)
  console.log(date2)

  var recibosDia = 'SELECT recibos.camion_id,acarreos_flete.cantidad,camiones.placas,proveedor_flete.razon_social AS prov_flete, fletes.unidad,proveedor_banco.razon_social AS prov_banco,conceptos.nombre_concepto,zonas.nombre_zona,obras.nombre_obra,COUNT(*) AS viajes FROM recibos LEFT JOIN camiones ON recibos.camion_id = camiones.camion_id LEFT JOIN proveedores AS proveedor_flete ON proveedor_flete.id = camiones.proveedor_id LEFT JOIN acarreos_flete ON recibos.recibo_id = acarreos_flete.recibo_id LEFT JOIN proveedores AS proveedor_banco ON proveedor_banco.id = acarreos_flete.banco_id LEFT JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN obras ON obras.obra_id = recibos.obra_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id WHERE hora BETWEEN "'+date1+'" AND "'+date2+'" AND numero = '+numero+' AND recibos.obra_id = '+obra_id+' GROUP BY zona_id AND concepto_flete;';
  db.query(recibosDia, function(err, recibos){
    console.log(recibos)
    if(err) throw err;
       else {
        if(recibos.length == 0) {
            res.render('resumen',{message:"No se encontraron acarreos de hoy de el camión seleccionado. Por favor intente de nuevo."})
        } else {
        res.render('recibosresumen',{recibos:recibos,fecha:hora_recibo})
        }
    }
  });
})



module.exports = router;
