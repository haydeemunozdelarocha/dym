var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var moment = require('moment-timezone');
var db = require('../../db.js');

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
      console.log('logged in')
      console.log(req.user)
      next();
    } else{
      res.redirect('/login');
    }
};

//agregar acarreo
router.post('/',isLoggedIn, function(req,res, next){
console.log(req.body)
var recibo;
var usuario_id = req.user.id_usuario;
var obra_id = req.user.obra_id;
var camion_id= Number(req.body.camion_id);
var foto = req.body.photo;
var unidad = req.body.unidad;
var fletero = req.body.fletero;
if(!foto){
  foto = null;
}
var camion_categoria = req.body.camion_categoria;
var direccion = req.body.direccion;
var categoria_flete = req.body.fletero_categoria;
var total_flete = req.body.precio_flete;
var zona_id = Number(req.body.zona_id);
var cantidad=req.body.capacidad;
var date = Date.now();
var timezone = "America/Mexico_City";
var hora= moment.tz(date,timezone).format("YYYY-MM-DD hh:mm A");
console.log(hora)
var flete_id = req.body.flete_id;
var banco_id = req.body.banco_id;
var concepto_flete = Number(req.body.concepto_flete);


  if(concepto_flete == 92){
    var material_id= concepto_flete;
    var total_material = (Number(req.body.precio_material)*cantidad);
    var concepto_material = req.body.concepto_material;
  } else if(concepto_flete == 82){
    banco_id = null;
  } else {
    var material_id= Number(req.body.material_id);
    var total_material = (Number(req.body.precio_material)*cantidad);
    var concepto_material = req.body.concepto_material;
    if(categoria_flete === 'flete/banco'){
      banco_id = fletero;
    }
  }
  var nuevoRecibo;
  var reciboValues;
    if(camion_categoria === "pipa"){
     nuevoRecibo = "INSERT INTO pipas_viajes(hora,usuario_id,camion_id,zona_id,direccion,material_id) VALUE (?,?,?,?,?,?);";
      reciboValues =[hora,usuario_id,camion_id,zona_id,direccion,material_id];
  } else {
      nuevoRecibo = "INSERT INTO recibos(usuario_id,zona_id,foto,hora,obra_id,camion_id) VALUES (?,?,?,?,?,?);";
      reciboValues = [usuario_id,zona_id,foto,hora,obra_id,camion_id];
  }
      db.query(nuevoRecibo,reciboValues, function(err, rows){
        console.log('sending query')
        console.log(reciboValues)
        console.log(nuevoRecibo)
        if(err) {
          console.log(err);
          res.render('error',{message: 'Hubo un error al capturar el acarreo.' })
        }
        else {
            recibo=rows.insertId;
              if(concepto_flete == 92){
                console.log('externo')
                  var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
                  var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,unidad,material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad];
              } else if (camion_categoria === "pipa"){
                    res.redirect('/captura');
              } else if (concepto_flete == 82){
                  console.log('interno')
                  var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
                  var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,unidad];
              } else {
                  if(categoria_flete === 'flete/banco'){
                      console.log('flete banco')
                        var nuevoAcarreo = 'INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
                        var values = [material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad];

                  } else {
                      var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
                      var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,unidad,material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad];
                  }
              }
              console.log(values);
              db.query(nuevoAcarreo,values,function(err, rows){
                if(err){
                  console.log(err);
                res.render('error',{message: 'Hubo un error al capturar el acarreo.' })

                }
                else {
                    res.redirect('/captura')
                }
              });
        }
      });
    })



//Read acarreos


router.post('/buscar', function(req,res,err){
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
    if (acarreos.length == 0){
      console.log('no se encontraron acarreos')
          var message = "No se encontraron acarreos sin estimación en éstas fechas."
            res.send({message: message});
    }
    else if (acarreos.length > 0){
      var message = "";
            res.send({acarreos: acarreos, message:message});
      }
  });
})

router.get('/flete/:id', function(req, res, next ){
  var id= req.params.id;
  var getAcarreo = "SELECT * FROM `acarreos_flete` WHERE `acarreo_id` = "+id;
  db.query(getAcarreo, function(err, acarreo){
    if(err) {
      res.send({message:'No se encontró ningun flete con ese id.'})
    }
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

router.get('/recibos', function(req, res, next ){
  var acarre ='SELECT recibos.camion_id, acarreos_flete.* FROM recibos JOIN acarreos_flete ORDER BY recibos.camion_id'
  db.query(acarre, function(err, acarreo){
    if(err) {
      res.send({message:'No se encontraron recibos.'})
    }
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

router.get('/acumulado',isLoggedIn, function(req, res, next ){
  var fecha = moment(new Date()).format("YYYY-MM-DD");
  var obra_id = req.user.obra_id;
  var acumulado ='SELECT conceptos.nombre_concepto,SUM(presupuestos.cantidad) AS total, SUM(acarreos_flete.cantidad) AS total_acumulado FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN presupuestos ON presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.zona = recibos.zona_id AND presupuestos.obra = recibos.obra_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete WHERE recibos.obra_id = '+obra_id+' AND acarreos_flete.concepto_flete = 82 GROUP BY concepto_flete UNION SELECT conceptos.nombre_concepto,SUM(presupuestos.cantidad),SUM(acarreos_material.cantidad) AS total_acumulado FROM recibos  JOIN acarreos_material ON acarreos_material.recibo_id = recibos.recibo_id JOIN presupuestos ON presupuestos.concepto = acarreos_material.concepto_material AND presupuestos.zona = recibos.zona_id AND presupuestos.obra = recibos.obra_id JOIN conceptos ON conceptos.conceptos_id = acarreos_material.concepto_material WHERE recibos.obra_id = '+obra_id+' GROUP BY concepto_material;';
  db.query(acumulado, function(err, acarreo){
    if(err) {
      res.send({message:'No se encontraron recibos.'})
    }
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

router.get('/viajes', function(req, res, next ){
  var fecha = moment(new Date()).format("YYYY-MM-DD");
  console.log(fecha);
  var date1 = fecha + " 00:00";
  var date2 = fecha + " 23:59";
  var acumulado ='SELECT COUNT(*) AS viajes FROM recibos JOIN acarreos_material ON acarreos_material.recibo_id = recibos.recibo_id JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id WHERE hora between "'+date1+'" AND "'+date2+'";';
  console.log(acumulado)
  db.query(acumulado, function(err, acarreo){
    if(err) {
      res.send({message:'No se encontraron recibos.'})
    }
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

router.get('/flete', function(req, res, next ){
  var getAcarreo = "SELECT * FROM `acarreos_flete`";
  db.query(getAcarreo, function(err, acarreo){
    if(err) {
    res.send({message:'No se encontró ningun acarreo de flete.'})
    }
    else {
        console.log('Buscando acarreo por id');
        res.send(acarreo)
    }
  });
})

router.get('/material', function(req, res, next ){
  var getAcarreo = "SELECT * FROM `acarreos_material`";
  db.query(getAcarreo, function(err, acarreo){
    if(err) {
      res.send({message:'No se encontró ningun acarreo de material.'})
    }
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
    if(err) {
      res.send({message:'No se encontraron acarreos de esta semana.'})
    }
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
    if(err) {
      res.send({message:'Hubo un error al eliminar el acarreo de flete.'})
    }
    else {
        res.send('done');
    }
  });
})

router.delete('/recibo/:id', function(req,res,err){
  var id=req.params.id;
  var borrarAcarreo = 'DELETE FROM recibos WHERE recibo_id='+id;
  db.query(borrarAcarreo, function(err, response){
    if(err){
      res.send({message:'Hubo un error al eliminar este recibo.'})
    }
    else {
        res.send('done');
    }
  });
})

router.delete('/material/:id', function(req,res,err){
  var id=req.params.id;
  var borrarAcarreo = 'DELETE FROM acarreos_material WHERE recibo_id='+id;
  db.query(borrarAcarreo, function(err, response){
    if(err) {
      res.send({message:'Hubo un error al eliminar el acarreo de material.'})
    }
    else {
        res.send('done');
    }
  });
})

router.get('/totales/:obra', function(req, res, next ){
  var obra= req.params.obra;
  var getAcarreoTotales = 'SELECT conceptos.nombre_concepto, sum(total) AS total_concepto, sum(cantidad) AS total_cantidad FROM acarreos LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN recibos ON acarreos.recibo_id = recibos.recibo_id JOIN conceptos ON concepto_flete = conceptos.conceptos_id OR conceptos.conceptos_id = materiales.concepto WHERE recibos.obra_id = ? GROUP BY concepto_flete, material_id;'
  db.query(getAcarreoTotales,[obra], function(err, totales){
    if(err) {
      res.send({message:'No se encontraron totales para esta obra.'})
    }
    else {
        console.log('Buscando presupuesto');
        res.json(totales)
    }
  });
})

router.post('/recibos/resumen',isLoggedIn, function(req, res, next ){
  var date= req.body.fecha;
  var categoria = req.body.categoria;
  var hora = moment(date).format("YYYY-MM-DD");
  var timezone = "America/Mexico_City";
  var hora_recibo= moment.tz(new Date(),timezone).format("YYYY-MM-DD hh:mm A");
  console.log(hora_recibo)
  var date1 = hora + " 00:00";
  var date2 = hora + " 23:59";
  var obra_id = req.user.obra_id;
  var numero = req.body.numero;

  if(categoria === "flete/banco"){
 var recibosDia = "SELECT stickers.sticker_id,camiones.placas,proveedores.razon_social as prov_flete, camiones.capacidad,camiones.unidad_camion FROM camiones LEFT JOIN stickers ON stickers.codigo = camiones.numero LEFT JOIN proveedores ON proveedores.id = camiones.proveedor_id WHERE camiones.numero = "+numero+"; SELECT recibos.recibo_id,recibos.hora,acarreos_material.acarreos_mat_id AS acarreo_id,conceptos.nombre_concepto AS concepto, zonas.nombre_zona,proveedores.razon_social,camiones.numero FROM recibos JOIN acarreos_material ON acarreos_material.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_material.concepto_material JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND camiones.numero = "+numero+" AND recibos.obra_id = "+obra_id+" UNION SELECT recibos.recibo_id,recibos.hora,acarreos_flete.acarreo_id AS acarreo_id,conceptos.nombre_concepto AS concepto, zonas.nombre_zona,proveedores.razon_social,camiones.numero FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND camiones.numero = "+numero+" AND recibos.obra_id = "+obra_id+" AND concepto_flete = 82; SELECT conceptos.nombre_concepto, zonas.nombre_zona,proveedores.razon_social, SUM(cantidad) AS total_cantidad,COUNT(*) AS viajes FROM recibos JOIN acarreos_material ON acarreos_material.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_material.concepto_material JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND camiones.numero = "+numero+" AND recibos.obra_id = "+obra_id+" GROUP BY nombre_zona,nombre_concepto UNION SELECT conceptos.nombre_concepto, zonas.nombre_zona,proveedores.razon_social,SUM(cantidad) AS total_cantidad,COUNT(*) AS viajes FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND camiones.numero = "+numero+" AND recibos.obra_id = "+obra_id+" AND concepto_flete = 82 GROUP BY nombre_concepto,nombre_zona;SELECT COUNT(recibos.camion_id) AS total_viajes FROM recibos LEFT JOIN camiones ON recibos.camion_id = camiones.camion_id LEFT JOIN proveedores AS proveedor_flete ON proveedor_flete.id = camiones.proveedor_id LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN obras ON obras.obra_id = recibos.obra_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND numero = "+numero+" AND recibos.obra_id = "+obra_id+";";
  } else {
  var recibosDia = "SELECT stickers.sticker_id,camiones.placas,proveedores.razon_social as prov_flete, camiones.capacidad,camiones.unidad_camion FROM camiones LEFT JOIN stickers ON stickers.codigo = camiones.numero LEFT JOIN proveedores ON proveedores.id = camiones.proveedor_id WHERE camiones.numero = "+numero+";SELECT recibos.recibo_id,recibos.hora,acarreos_flete.acarreo_id AS acarreo_id,conceptos.nombre_concepto AS concepto, zonas.nombre_zona,proveedores.razon_social,camiones.numero FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND camiones.numero = "+numero+" AND recibos.obra_id = "+obra_id+";SELECT conceptos.nombre_concepto, zonas.nombre_zona,proveedores.razon_social,count(*) AS viajes,SUM(cantidad) AS total_cantidad FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND camiones.numero = "+numero+" AND recibos.obra_id = "+obra_id+" GROUP BY nombre_concepto,nombre_zona;SELECT COUNT(recibos.camion_id) AS total_viajes FROM recibos LEFT JOIN camiones ON recibos.camion_id = camiones.camion_id LEFT JOIN proveedores AS proveedor_flete ON proveedor_flete.id = camiones.proveedor_id LEFT JOIN acarreos_flete ON recibos.recibo_id = acarreos_flete.recibo_id LEFT JOIN proveedores AS proveedor_banco ON proveedor_banco.id = acarreos_flete.banco_id LEFT JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN obras ON obras.obra_id = recibos.obra_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND numero = "+numero+" AND recibos.obra_id = "+obra_id+";";
}
  console.log(recibosDia)
  db.query(recibosDia, function(err, recibos){
    console.log(recibos)
    if(err) {
      res.send({message:'No se encontraron totales para esta obra.'})
      }
       else {
        if(recibos[0].length == 0) {
            res.render('resumen',{message:"No se encontraron acarreos de hoy de el camión seleccionado. Por favor intente de nuevo."})
        } else {
        res.render('recibosresumen',{camion:recibos[0],acarreos:recibos[1],resumen:recibos[2],total:recibos[3],fecha_impresion:hora_recibo,fecha:hora, message: ''})
        }
    }
  });
})

router.post('/pipa/resumen',isLoggedIn, function(req, res, next ){

  var date= req.body.fechaRecibo;
  console.log(date);
  var hora = moment(date).format("YYYY-MM-DD");
  var hora_recibo = moment(date).format("YYYY-MM-DD HH:mm");
  var date1 = hora + " 00:00";
  var date2 = hora + " 23:59";
  var obra_id = req.user.obra_id;
  var numero = req.body.numero;
  console.log(date1)
  console.log(date2)
  var getHoras = 'SELECT TIMEDIFF((SELECT pipas_viajes.hora FROM pipas_viajes WHERE pipas_viajes.hora between "'+date1+'" and "'+date2+'" ORDER BY pipas_viajes.hora DESC LIMIT 1),(SELECT pipas_viajes.hora FROM pipas_viajes WHERE pipas_viajes.hora between "'+date1+'" and "'+date2+'" ORDER BY pipas_viajes.hora ASC LIMIT 1)) AS days;SELECT proveedores.categoria FROM stickers INNER JOIN camiones ON camiones.numero = stickers.codigo INNER JOIN proveedores ON proveedores.id = camiones.proveedor_id WHERE numero = '+numero+';SELECT pipas_viajes.zona_id,pipas_viajes.foto,pipas_viajes.material_id,pipas_viajes.hora,pipas_viajes.usuario_id,pipas_viajes.camion_id,usuarios.obra_id FROM pipas_viajes LEFT JOIN usuarios ON usuarios.id_usuario = pipas_viajes.usuario_id WHERE hora between "'+date1+'" and "'+date2+'" GROUP BY zona_id;';
  // var recibosDia = 'SELECT recibos.camion_id,acarreos_flete.cantidad,camiones.placas,proveedor_flete.razon_social AS prov_flete, acarreos_flete.unidad,proveedor_banco.razon_social AS prov_banco,conceptos.nombre_concepto,zonas.nombre_zona,obras.nombre_obra,COUNT(*) AS viajes,SUM(cantidad) AS total_cantidad FROM recibos LEFT JOIN camiones ON recibos.camion_id = camiones.camion_id LEFT JOIN proveedores AS proveedor_flete ON proveedor_flete.id = camiones.proveedor_id LEFT JOIN acarreos_flete ON recibos.recibo_id = acarreos_flete.recibo_id LEFT JOIN proveedores AS proveedor_banco ON proveedor_banco.id = acarreos_flete.banco_id LEFT JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN obras ON obras.obra_id = recibos.obra_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id WHERE hora BETWEEN "'+date1+'" AND "'+date2+'" AND numero = '+numero+' AND recibos.obra_id = '+obra_id+' GROUP BY concepto_flete;SELECT recibos.hora,acarreos_flete.cantidad,proveedor_flete.razon_social AS prov_flete, acarreos_flete.unidad,proveedor_banco.razon_social AS prov_banco,conceptos.nombre_concepto,zonas.nombre_zona,obras.nombre_obra FROM recibos LEFT JOIN camiones ON recibos.camion_id = camiones.camion_id LEFT JOIN proveedores AS proveedor_flete ON proveedor_flete.id = camiones.proveedor_id LEFT JOIN acarreos_flete ON recibos.recibo_id = acarreos_flete.recibo_id LEFT JOIN proveedores AS proveedor_banco ON proveedor_banco.id = acarreos_flete.banco_id LEFT JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN obras ON obras.obra_id = recibos.obra_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id WHERE hora BETWEEN "'+date1+'" AND "'+date2+'" AND numero = '+numero+' AND recibos.obra_id = '+obra_id+';SELECT COUNT(recibos.camion_id) AS total_viajes FROM recibos LEFT JOIN camiones ON recibos.camion_id = camiones.camion_id LEFT JOIN proveedores AS proveedor_flete ON proveedor_flete.id = camiones.proveedor_id LEFT JOIN acarreos_flete ON recibos.recibo_id = acarreos_flete.recibo_id LEFT JOIN proveedores AS proveedor_banco ON proveedor_banco.id = acarreos_flete.banco_id LEFT JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN obras ON obras.obra_id = recibos.obra_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id WHERE hora BETWEEN "'+date1+'" AND "'+date2+'" AND numero = '+numero+' AND recibos.obra_id = '+obra_id+';';
  console.log(getHoras)
  db.query(getHoras, function(err, horas){
    if(err) {
      res.send({message:'No se encontraron totales para esta obra.'})
      }
       else {
        console.log(horas)
        if(horas.length == 0) {
            res.render('resumen',{message:"No se encontraron acarreos de hoy de el camión seleccionado. Por favor intente de nuevo."})
        } else {
          var dias = Number(horas[0][0])/10;
          console.log(horas[0][0].days);
          var categoria_flete = horas[1][0];
          var reciboValues = '';
          for(var i = 0; i <= horas[2].length;i++){
            var item = new Array();
          for (var key in horas[2][i]) {
            console.log(Object.keys(horas[2][i]).length)
            item.push(horas[2][i][key]);
            console.log(item)
            if(Object.keys(horas[2][i]).length == item.length){
              if(i < horas[2].length-1){
              reciboValues = reciboValues +'('+ item.toString() +'),';
              console.log(reciboValues);
              } else {
              reciboValues = reciboValues +'('+ item.toString() +')';
              console.log(reciboValues);
              }
            }
          }
          }
        //   if(categoria_flete === 'flete/banco'){
        //     console.log('flete banco')
        //     var nuevoAcarreo = 'INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
        //     var values = [material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad];
        //     } else {
        //               var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
        //               var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,unidad,material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad];
        // }
    }
  }
  });
})

module.exports = router;
