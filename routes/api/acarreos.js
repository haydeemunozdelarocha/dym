var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var moment = require('moment-timezone');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');
var csv = require('express-csv');
var later = require('later');
var async = require('async');
var fs = require('fs');
var S3FS = require('s3fs');
var rp = require('request-promise');


var fsImpl = new S3FS('dymingenieros', {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

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
// router.post('/',isLoggedIn, function(req,res, next){
// var recibo;
// var usuario_id = req.user.id_usuario;
// if(req.user.categoria === "checador"){
// var obra_id = req.user.obra_id;
// } else {
//  var obra_id = req.body.obra_id;
// }
// var camion_id= Number(req.body.camion_id);
// var foto = req.body.photo;
// var unidad = req.body.unidad;
// var fletero = req.body.fletero;
// if(!foto){
//   foto = null;
// }
// var camion_categoria = req.body.camion_categoria;
// var categoria_flete = req.body.fletero_categoria;
// var total_flete = req.body.precio_flete;
// var zona_id = Number(req.body.zona_id);
// var cantidad=req.body.capacidad;
// if(req.user.categoria === "checador" && !req.body.hour){
// // var date = Date.now();
// var date = '2017-08-11 09:00';
// var timezone = req.user.timezone;
// var hora= moment.tz(date,timezone).format("YYYY-MM-DD hh:mm A");
// var metodo = 'E';
// var hora_edicion= '';
// var razon = '';
// } else {
//  var date = new Date(req.body.date + ' ' + req.body.hour + ':'+req.body.minutes+ ' '+req.body.meridian);
//  var hora= moment(date).format("YYYY-MM-DD hh:mm A");
//  var metodo = 'M';
//  var date2 = Date.now();
//  console.log('date');
//    console.log(date2);
//    var timezone2 = req.user.timezone;
//   var hora_edicion =moment.tz(date2,timezone2).format("YYYY-MM-DD hh:mm A");
//   var razon = req.body.razon;
//     console.log(hora_edicion);
// }

// var flete_id = req.body.flete_id;
// var banco_id = req.body.banco_id;
// var concepto_flete = Number(req.body.concepto_flete);


//   if(concepto_flete == 92){
//     var material_id= concepto_flete;
//     var total_material = (Number(req.body.precio_material)*cantidad);
//     var concepto_material = req.body.concepto_material;
//   } else if(concepto_flete == 82){
//     banco_id = null;
//   } else {
//     var material_id= Number(req.body.material_id);
//     var total_material = (Number(req.body.precio_material)*cantidad);
//     var concepto_material = req.body.concepto_material;
//     if(categoria_flete === 'flete/banco'){
//       banco_id = fletero;
//     }
//   }
//   var nuevoRecibo;
//   var reciboValues;
//     if(camion_categoria === "pipa"){
//      nuevoRecibo = "INSERT INTO pipas_viajes(entrada,usuario_id,camion_id,zona_id,material_id,flete_id,unidad) VALUE (?,?,?,?,?,?,?);";
//       reciboValues =[hora,usuario_id,camion_id,zona_id,material_id,flete_id,unidad];
//   } else {
//       nuevoRecibo = "INSERT INTO recibos(usuario_id,zona_id,foto,hora,obra_id,camion_id,metodo,hora_edicion,razon) VALUES (?,?,?,?,?,?,?,?,?);";
//       reciboValues = [usuario_id,zona_id,foto,hora,obra_id,camion_id,metodo,hora_edicion,razon];
//   }
//       db.query(nuevoRecibo,reciboValues, function(err, rows){
//         console.log('sending query')
//         console.log(reciboValues)
//         console.log(nuevoRecibo)
//         if(err) {
//           console.log(err);
//           res.render('error',{message: 'Hubo un error al capturar el acarreo.' })
//         }
//         else {
//             recibo=rows.insertId;
//               if(concepto_flete == 92){
//                 console.log('externo')
//                   var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
//                   var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,unidad,material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad];
//               } else if (camion_categoria === "pipa"){
//                     res.redirect('/captura');
//               } else if (concepto_flete == 82){
//                   console.log('interno')
//                   var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
//                   var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,unidad];
//               } else {
//                   if(categoria_flete === 'flete/banco'){
//                         console.log(categoria_flete);
//                       console.log('flete banco')
//                         var nuevoAcarreo = 'INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
//                         var values = [material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad];

//                   } else {
//                     console.log('flete');
//                     console.log(categoria_flete);
//                       var nuevoAcarreo = 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);'
//                       var values = [cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,unidad,material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad];
//                   }
//               }
//               console.log(values);
//               db.query(nuevoAcarreo,values,function(err, rows){
//                 if(err){
//                   console.log(err);
//                 res.render('error',{message: 'Hubo un error al capturar el acarreo.' })

//                 }
//                 else {
//                   console.log(req.body.date);
//                   if(req.user.categoria === "checador" && !req.body.date){
//                     res.redirect('/captura')
//                   } else if(req.user.categoria === "checador" && req.body.date) {
//                     res.send({status:'success'})
//                   } else if(req.user.categoria !== "checador"){
//                     res.redirect('/acarreos/nuevo')
//                   }
//                 }
//               });
//         }
//       });
//     })

router.post('/',isLoggedIn, function(req,res, next){
console.log(req.body)
var recibo;
var usuario_id = req.user.id_usuario;
if(req.user.categoria === "checador"){
var obra_id = req.user.obra_id;
} else {
 var obra_id = req.body.obra_id;
}
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
var zona_id = Number(req.body.zona_id);
var cantidad=req.body.capacidad;
if(req.user.categoria === "checador" && !req.body.hour){
var date = Date.now();
var timezone = req.user.timezone;
console.log(timezone);
var hora= moment.tz(date,timezone).format("YYYY-MM-DD hh:mm A");
console.log(hora);
var metodo = 'E';
var hora_edicion= null;
var razon = null;
} else {
 var date = new Date(req.body.date + ' ' + req.body.hour + ':'+req.body.minutes+ ' '+req.body.meridian);
 var hora= moment(date).format("YYYY-MM-DD hh:mm A");
  var metodo = 'M';
 var date2 = Date.now();
   var timezone2 = req.user.timezone;
   console.log(timezone2);
  var hora_edicion =moment.tz(date2,timezone2).format("YYYY-MM-DD hh:mm A");
  var razon = req.body.razon;
}
if(req.body.flete_id.length >0) {
var flete_id = req.body.flete_id;
}else {
  var flete_id = null;
}
var concepto_flete = Number(req.body.concepto_flete);
var total_flete = (Number(req.body.precio_flete)*Number(cantidad));

if(concepto_flete == 82){
    banco_id = null;
  } else {
var banco_id = req.body.banco_id;
}
console.log(req.body.precio_material)
    var material_id= Number(req.body.material_id);
    var total_material = (Number(cantidad)*Number(req.body.precio_material));
    var concepto_material = req.body.concepto_material;

  var nuevoRecibo;
  var reciboValues;
    if(camion_categoria === "pipa"){
     nuevoRecibo = "INSERT INTO pipas_viajes(entrada,usuario_id,camion_id,zona_id,material_id,flete_id,unidad) VALUE (?,?,?,?,?,?,?);";
      reciboValues =[hora,usuario_id,camion_id,zona_id,material_id,flete_id,unidad];
      } else {
       nuevoRecibo = "INSERT INTO recibos(usuario_id,zona_id,foto,hora,obra_id,camion_id,metodo,hora_edicion,razon) VALUES (?,?,?,?,?,?,?,?,?);";
      reciboValues = [usuario_id,zona_id,foto,hora,obra_id,camion_id,metodo,hora_edicion,razon];
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
               if (camion_categoria === "pipa"){
                    res.redirect('/captura');
              } else {
                var nuevoAcarreo = '';
                var values = [];
                recibo=rows.insertId;
                console.log(recibo);
                if(req.body.flete_id.length >0) {
                  nuevoAcarreo = nuevoAcarreo +'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);';
                    values.push.apply(values,[cantidad,total_flete,recibo,concepto_flete,flete_id,banco_id,unidad]);
                    }
                  console.log('cantidad:'+cantidad);
                  console.log('recibo:'+recibo);
                if(concepto_flete != 82){
                nuevoAcarreo = nuevoAcarreo+'INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE (?,?,?,?,?,?,?);';
                values.push.apply(values,[material_id,cantidad,total_material,concepto_material,recibo,banco_id,unidad]);
                }
              console.log(nuevoAcarreo)
              console.log(values);
              db.query(nuevoAcarreo,values,function(err, rows){
                if(err){
                  console.log(err);
                res.render('error',{message: 'Hubo un error al capturar el acarreo.' })

                }
                else {
                  if(req.user.categoria === "checador" && !req.body.date){
                    res.redirect('/captura')
                  } else if(req.user.categoria === "checador" && req.body.date) {
                    res.send({status:'success'})
                  } else if(req.user.categoria !== "checador"){
                    res.redirect('/acarreos/nuevo')
                  }
                }
              });
        }
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

router.get('/recibo/:id', function(req, res, next ){
  var recibo_id= req.params.id;
  var getAcarreo = "SELECT recibos.*,camiones.proveedor_id,acarreos_material.*,acarreos_flete.* FROM `recibos` JOIN acarreos_material ON acarreos_material.recibo_id = recibos.recibo_id LEFT JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN camiones ON recibos.camion_id = camiones.camion_id JOIN proveedores ON recibos.camion_id = camiones.camion_id WHERE recibos.recibo_id = "+recibo_id+' LIMIT 1;';
  console.log(getAcarreo)
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

router.post('/update/:id', function(req, res, next ){
  var recibo_id= req.params.id;
  var concepto = Number(req.body.concepto);
  var banco_id=req.body.banco_id;
  var material_id=req.body.material_id;
  var zona_id=req.body.zona_id;
  var flete_id=req.body.flete_id;
  var categoria=req.body.categoria;
  var date2 = Date.now();
  var timezone2 = req.user.timezone;
  var hora_edicion =moment.tz(date2,timezone2).format("YYYY-MM-DD hh:mm A");
    var getAcarreo = "SET @acarreos_mat_id := (SELECT acarreos_mat_id FROM acarreos_material WHERE recibo_id ="+recibo_id+");UPDATE recibos SET zona_id = "+zona_id+" WHERE recibos.recibo_id = "+recibo_id+";UPDATE acarreos_material SET material_id = "+material_id+",concepto_material = "+concepto+",banco_id = "+banco_id+" WHERE acarreos_mat_id = @acarreos_mat_id;UPDATE recibos SET hora_edicion = '"+hora_edicion+"' WHERE recibo_id = "+recibo_id;
    console.log(concepto);
  if(categoria === "flete" || concepto == 92){
    getAcarreo += "SET @acarreos_id := (SELECT acarreo_id FROM acarreos_flete WHERE recibo_id ="+recibo_id+");UPDATE acarreos_flete SET banco_id = "+banco_id+",flete_id="+flete_id+" WHERE acarreo_id = "+recibo_id+";UPDATE recibos SET hora_edicion = '"+hora_edicion+"' WHERE recibo_id = "+recibo_id+";";
  }
  console.log(getAcarreo);
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

router.get('/download/:estimacionid', function(req, res, next ){
  var estimacion = req.params.estimacionid;
  var getAcarreo = 'SELECT "Flete" As Type, acarreos_flete.recibo_id,razon_social,cantidad,acarreos_flete.unidad, nombre_concepto, total_flete,estimacion,hora,nombre_zona,stickers.sticker_id,foto FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id  JOIN camiones ON recibos.camion_id = camiones.camion_id JOIN proveedores ON proveedores.id = camiones.proveedor_id JOIN stickers ON stickers.codigo = camiones.numero WHERE estimacion_id = '+estimacion+' UNION SELECT "Material", acarreos_material.recibo_id,proveedores.razon_social,acarreos_material.cantidad,acarreos_material.unidad, nombre_concepto, acarreos_material.total_material,acarreos_material.estimacion,recibos.hora,zonas.nombre_zona,stickers.sticker_id,recibos.foto FROM recibos LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN materiales ON materiales.id = acarreos_material.material_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id JOIN stickers ON stickers.codigo = camiones.numero WHERE estimacion_id = '+estimacion+' ORDER BY sticker_id,hora;';
  db.query(getAcarreo, function(err, acarreos){
    if(err) {
      console.log(err)
      res.send({message:'No se encontró ningun flete con ese id.'})
    }
    else {
        console.log('Buscando acarreo por id');
          var headers = {};
          for (header in acarreos[0]) {
            headers[header] = header;
          }
          var resultWithHeaders = [];
          resultWithHeaders.push(headers);
          resultWithHeaders = resultWithHeaders.concat(acarreos);
          res.csv(resultWithHeaders);
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
  var borrarAcarreo = 'DELETE FROM recibos WHERE recibo_id='+id+';SET @acarreo_mat_id := (SELECT acarreos_mat_id FROM acarreos_material WHERE recibo_id = '+id+');DELETE FROM acarreos_material WHERE acarreos_mat_id = @acarreo_mat_id;SET @acarreo_id := (SELECT acarreo_id FROM acarreos_flete WHERE recibo_id = '+id+');DELETE  FROM acarreos_flete WHERE acarreo_id = @acarreo_id;SELECT * FROM acarreos_material WHERE recibo_id = '+id+';';
  console.log(borrarAcarreo)
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

router.get('/recibos/resumen',isLoggedIn, function(req, res, next ){
  var date= req.query.fecha;
  var categoria = req.query.categoria;
  console.log(categoria);
  var hora = moment(date).format("YYYY-MM-DD");
  var timezone = req.user.timezone;
  var hora_recibo= moment.tz(new Date(),timezone).format("YYYY-MM-DD hh:mm A");
  console.log(hora_recibo)
  var date1 = hora + " 00:00";
  var date2 = hora + " 23:59";
  var obra_id = req.user.obra_id;
  var camion_id = req.query.camion_id;

  if(categoria === "flete/banco"){
 var recibosDia = "SELECT stickers.sticker_id,camiones.camion_id,camiones.firma,camiones.placas,proveedores.razon_social as prov_flete,camiones.proveedor_id,camiones.categoria as camion_categoria,camiones.capacidad,camiones.unidad_camion FROM camiones LEFT JOIN stickers ON stickers.codigo = camiones.numero LEFT JOIN proveedores ON proveedores.id = camiones.proveedor_id WHERE camiones.camion_id = "+camion_id+"; SELECT recibos.recibo_id,recibos.aprobado,recibos.hora_edicion,recibos.hora,acarreos_material.acarreos_mat_id AS acarreo_id,conceptos.nombre_concepto AS concepto, zonas.nombre_zona,proveedores.razon_social,camiones.numero FROM recibos JOIN acarreos_material ON acarreos_material.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_material.concepto_material JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND camiones.camion_id = "+camion_id+" AND recibos.obra_id = "+obra_id+" AND aprobado = 'N' UNION SELECT recibos.recibo_id,recibos.aprobado,recibos.hora_edicion,recibos.hora,acarreos_flete.acarreo_id AS acarreo_id,conceptos.nombre_concepto AS concepto, zonas.nombre_zona,proveedores.razon_social,camiones.numero FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND aprobado = 'N' AND camiones.camion_id = "+camion_id+" AND recibos.obra_id = "+obra_id+" AND concepto_flete = 82 ORDER by hora ASC; SELECT conceptos.nombre_concepto, zonas.nombre_zona,proveedores.razon_social, SUM(cantidad) AS total_cantidad,COUNT(*) AS viajes FROM recibos JOIN acarreos_material ON acarreos_material.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_material.concepto_material JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND aprobado = 'N' AND camiones.camion_id = "+camion_id+" AND recibos.obra_id = "+obra_id+" GROUP BY nombre_zona,nombre_concepto UNION SELECT conceptos.nombre_concepto, zonas.nombre_zona,proveedores.razon_social,SUM(cantidad) AS total_cantidad,COUNT(*) AS viajes FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND aprobado = 'N' AND camiones.camion_id = "+camion_id+" AND recibos.obra_id = "+obra_id+" AND concepto_flete = 82 GROUP BY nombre_concepto,nombre_zona;SELECT COUNT(recibos.camion_id) AS total_viajes FROM recibos LEFT JOIN camiones ON recibos.camion_id = camiones.camion_id LEFT JOIN proveedores AS proveedor_flete ON proveedor_flete.id = camiones.proveedor_id LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN obras ON obras.obra_id = recibos.obra_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND aprobado = 'N' AND recibos.camion_id = "+camion_id+" AND recibos.obra_id = "+obra_id+";SELECT * FROM conceptos;SELECT id,razon_social FROM proveedores WHERE categoria != 'flete';SELECT * FROM descripcion_edicion;";
  } else {
  var recibosDia = "SELECT stickers.sticker_id,camiones.camion_id,camiones.firma,camiones.placas,camiones.proveedor_id,proveedores.razon_social as prov_flete, camiones.categoria as camion_categoria,camiones.capacidad,camiones.unidad_camion FROM camiones LEFT JOIN stickers ON stickers.codigo = camiones.numero LEFT JOIN proveedores ON proveedores.id = camiones.proveedor_id WHERE camiones.camion_id = "+camion_id+";SELECT recibos.recibo_id,recibos.aprobado,recibos.hora_edicion,recibos.hora,acarreos_flete.acarreo_id AS acarreo_id,conceptos.nombre_concepto AS concepto, zonas.nombre_zona,proveedores.razon_social,camiones.numero FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND aprobado = 'N' AND camiones.camion_id = "+camion_id+" AND recibos.obra_id = "+obra_id+" ORDER by hora ASC;SELECT conceptos.nombre_concepto, zonas.nombre_zona,count(*) AS viajes,SUM(cantidad) AS total_cantidad FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date1+"' AND '"+date2+"' AND camiones.camion_id = "+camion_id+" AND aprobado = 'N' AND recibos.obra_id = "+obra_id+" GROUP BY nombre_concepto,nombre_zona;SELECT COUNT(*) AS viajes FROM recibos JOIN acarreos_material ON acarreos_material.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_material.concepto_material JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date2+"' AND '"+date2+"' AND camiones.camion_id = "+camion_id+" AND aprobado = 'N' AND recibos.obra_id = "+obra_id+" GROUP BY nombre_zona,nombre_concepto UNION SELECT COUNT(*) AS viajes FROM recibos JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN proveedores ON proveedores.id = acarreos_flete.banco_id JOIN camiones ON recibos.camion_id = camiones.camion_id WHERE hora BETWEEN '"+date2+"' AND '"+date2+"' AND camiones.camion_id = "+camion_id+" AND recibos.obra_id = "+obra_id+" AND aprobado = 'N' AND concepto_flete = 82 GROUP BY nombre_concepto,nombre_zona;SELECT * FROM conceptos;SELECT id,razon_social FROM proveedores WHERE categoria != 'flete';SELECT * FROM descripcion_edicion;";
}
  console.log(recibosDia)
  db.query(recibosDia, function(err, recibos){
    console.log(recibos)
    var firma = '';
    if(err) {
      res.send({message:'No se encontraron totales para esta obra.'})
      } else {
        if(recibos[0].length == 0) {
            res.render('resumen',{message:"No se encontraron acarreos de hoy de el camión seleccionado. Por favor intente de nuevo.",moment:moment})
        } else {
          if(recibos[0][0].firma){
                var  file= 'signaturerecibos/'+recibos[0][0].firma;
                console.log(file);
                var bitmap = fsImpl.readFile(file, function(err,data){
                    if (err){
                      console.log(err);
                    } else {
                    firma = new Buffer(data,'binary').toString('base64');
                      res.render('revisaracarreos',{camion:recibos[0],acarreos:recibos[1],resumen:recibos[2],total:recibos[3],conceptos:recibos[4],fecha_impresion:hora_recibo,bancos:recibos[5],fecha:hora, categoria:categoria,message: '',moment:moment,firma:'data:image/jpg;base64,'+firma,razones:recibos[6]});
                }
                })
          } else {
            res.render('revisaracarreos',{camion:recibos[0],acarreos:recibos[1],resumen:recibos[2],total:recibos[3],conceptos:recibos[4],fecha_impresion:hora_recibo,bancos:recibos[5],fecha:hora, categoria:categoria,message: '',moment:moment,firma:'data:image/jpg;base64,',razones:recibos[6]})
          }
        }
      }
    })
  })


router.post('/pipa/resumen',isLoggedIn, function(req, res, next ){
  var camion_id = req.body.camion_id;
  var categoria = req.body.categoria;

  var obra_id = req.user.obra_id;
  var sticker_id = req.body.sticker;

  var date= req.body.fecha;
  var hora = moment(date).format("YYYY-MM-DD");

  var date1 = Date.now();
  var timezone = req.user.timezone;
  console.log(hora);
  console.log(moment.tz(date1,timezone).format("YYYY-MM-DD"));
  console.log(hora !== moment.tz(date1,timezone).format("YYYY-MM-DD"))
  if(hora !== moment.tz(date1,timezone).format("YYYY-MM-DD")){
    res.redirect('/api/acarreos/recibos/resumen?camion_id='+camion_id+'&categoria='+ encodeURIComponent(categoria)+'&fecha='+encodeURIComponent(hora));


  } else {
  var hora_recibo= moment.tz(date1,timezone).format("YYYY-MM-DD hh:mm A");

  var date1 = hora + " 00:00";
  var date2 = hora + " 23:59";
  console.log(hora_recibo);

  var getLastRecibo = 'UPDATE pipas_viajes SET salida ="'+hora_recibo+'", horas = (time_to_sec(timediff( STR_TO_DATE("'+hora_recibo+'", "%Y-%m-%d %h:%i %p"),STR_TO_DATE(pipas_viajes.entrada, "%Y-%m-%d %h:%i %p")))/3600), acarreo = "Y" WHERE entrada BETWEEN "'+date1+'" AND "'+date2+'" AND camion_id = '+camion_id+' AND acarreo = "N" LIMIT 1;INSERT INTO recibos(usuario_id,zona_id,hora,obra_id,camion_id) SELECT pipas_viajes.usuario_id,pipas_viajes.zona_id,pipas_viajes.entrada,usuarios.obra_id,pipas_viajes.camion_id FROM pipas_viajes JOIN usuarios ON pipas_viajes.usuario_id = usuarios.id_usuario WHERE entrada BETWEEN "'+date1+'" AND "'+date2+'" AND camion_id = '+camion_id+' LIMIT 1;SELECT pipas_viajes.entrada,pipas_viajes.material_id,pipas_viajes.flete_id,pipas_viajes.zona_id,materiales.concepto,pipas_viajes.salida,materiales.unidad as unidad_material,camiones.unidad_camion,camiones.capacidad,pipas_viajes.horas,fletes.unidad as unidad_flete,fletes.precio as precio_flete,materiales.proveedor_id as banco_id,materiales.precio as precio_material FROM pipas_viajes JOIN camiones ON pipas_viajes.camion_id = camiones.camion_id JOIN materiales ON materiales.id = pipas_viajes.material_id LEFT JOIN fletes ON fletes.fletes_id = pipas_viajes.flete_id WHERE entrada BETWEEN "'+date1+'" AND "'+date2+'" AND pipas_viajes.camion_id = '+camion_id+' LIMIT 1;';
    var query = '';
  console.log(getLastRecibo);
    db.query(getLastRecibo, function(err,recibo){
      if(err){
          res.json({error:err})
      } else {
        if(recibo[0].changedRows == 0){
              res.redirect('/api/acarreos/recibos/resumen?camion_id='+camion_id+'&categoria='+ encodeURIComponent(categoria)+'&fecha='+encodeURIComponent(hora));
        } else {
        console.log(recibo[1]);
        var recibo_id = recibo[1].insertId;
        if(recibo[2][0].flete_id){
        if(recibo[2][0].unidad_flete === 'dias'){
          if(recibo[2][0].horas < 4){
          var cantidad_flete = .5;
          } else if(recibo[2][0].horas >4){
           var cantidad_flete = 1;
          }
        } else {
           var cantidad_flete = recibo[2][0].capacidad;
        }
        var unidad_flete = recibo[2][0].unidad_flete;
        var concepto_flete = recibo[2][0].concepto;
        var total_flete = (cantidad_flete*Number(recibo[2][0].precio_flete));
        var flete_id = recibo[2][0].flete_id;
        var banco_id = recibo[2][0].banco_id;
        query = query+ 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE ('+cantidad_flete+','+total_flete+','+recibo_id+','+concepto_flete+','+flete_id+','+banco_id+',"'+unidad_flete+'");';
        }
        if(recibo[2][0].material_id){
        if(recibo[2][0].unidad_material === 'dias'){
          if(recibo[2][0].horas < 4){
          var cantidad_material = .5;
          } else if(recibo[2][0].horas >4){
           var cantidad_material = 1;
          }
        } else {
           var cantidad_material = recibo[2][0].capacidad;
        }
        var concepto_material = recibo[2][0].concepto;
        var total_material = (cantidad_material*Number(recibo[2][0].precio_material));
        var material_id = recibo[2][0].material_id;
        var banco_id = recibo[2][0].banco_id;
        var unidad_material = recibo[2][0].unidad_material;
        query =query+'INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE ('+material_id+','+cantidad_material+','+total_material+','+concepto_material+','+recibo_id+','+banco_id+',"'+unidad_material+'");';
              console.log(query);
        }
        console.log(query)

            db.query(query, function(err, recibos){
              console.log(recibos)
              if(err) {
                console.log(err)
                res.send({message:'No se encontraron recibos para esta pipa.'})
                }
                 else {
                res.redirect('/api/acarreos/recibos/resumen?camion_id='+camion_id+'&categoria='+ encodeURIComponent(categoria)+'&fecha='+encodeURIComponent(hora));

                }
            });
        }
      }
    })
}
  });



router.post('/signature',isLoggedIn, function(req, res, err ){
 console.log('getting photo')
 console.log(req.body)
  var camion_id = req.body.camion_id;
  var pin = req.body.pin;
  var body = req.body.image;
  var acarreos = req.body.acarreos;
  console.log(acarreos)
  acarreos = acarreos.join(", ");
console.log(acarreos);
    body = body.split(",")[1];
    body = new Buffer(body, 'base64');
    var photoBase = new Buffer(body, 'binary').toString('base64');
    var path ='signaturerecibos/'+camion_id+'.jpg';
    console.log(path)
    photo="https://s3.amazonaws.com/dymingenieros/"+path;
           fsImpl.writeFile(path, body, {"ContentType":"binary/octet-stream", "ContentEncoding":"base64"}, function(err){
            if (err) {
              res.json({error:err})
            }
            console.log('File saved.')

          var agregarFirma = 'UPDATE camiones SET pin= '+pin+', firma= "'+camion_id+'.jpg" WHERE camion_id = '+camion_id+';UPDATE recibos SET aprobado = "Y" WHERE recibo_id IN ('+acarreos+');';
          console.log(agregarFirma)
          db.query(agregarFirma, function(err,firma){
            if(err){
              res.json({error:err})
            }
            res.json({photo:'data:image/jpg;base64,'+photoBase})
          })
        })


});

router.post('/lastviaje',isLoggedIn, function(req, res, err ){
 console.log(req.body)
  var camion_id = req.body.camion_id;
  var fecha = moment(req.body.fecha).format("YYYY-MM-DD");
  var date1 = fecha + ' 00:00';
  var date2 = fecha + ' 23:59';

    var getViaje = 'SELECT pipas_viajes.viaje_id,pipas_viajes.entrada FROM pipas_viajes JOIN camiones ON pipas_viajes.camion_id = camiones.camion_id JOIN materiales ON materiales.id = pipas_viajes.material_id LEFT JOIN fletes ON fletes.fletes_id = pipas_viajes.flete_id WHERE entrada BETWEEN "'+date1+'" AND "'+date2+'" AND pipas_viajes.camion_id = '+camion_id+' AND pipas_viajes.salida IS NULL ORDER BY pipas_viajes.entrada DESC LIMIT 1';
    console.log(getViaje)
          db.query(getViaje, function(err,response){
            if(err){
              res.json({error:err})
            }
            res.json(response)
          })
        })

router.post('/cerrarviaje',isLoggedIn, function(req, res, err){
  console.log('cerrando')
  console.log(req.body);

  var viaje_id = req.body.viaje_id;
  var camion_id = req.body.camion_id;

 var date2 = Date.now();
var timezone = req.user.timezone;
var hora_edicion= moment.tz(date2,timezone).format("YYYY-MM-DD hh:mm A");
var viajequery = '';
var usuario_id = req.user.id_usuario;
var zona_id = req.body.zona_id;
var material_id = req.body.material_id;
var razon = req.body.razon;
if(!material_id){
  material_id = null;
}
var flete_id = req.body.flete_id;
if(!flete_id){
  flete_id = null;
}
var salida = req.body.salida;
 var hora_recibo= moment(salida).format("YYYY-MM-DD hh:mm A");
if(req.body.entrada){
  var entrada=req.body.entrada;
viajequery = "INSERT INTO pipas_viajes(entrada,salida,usuario_id,camion_id,zona_id,material_id,flete_id,horas) VALUE ('"+entrada+"','"+salida+"',"+usuario_id+","+camion_id+","+zona_id+","+material_id+","+flete_id+",(time_to_sec(timediff( STR_TO_DATE('"+salida+"', '%Y-%m-%d %h:%i %p'),STR_TO_DATE('"+entrada+"', '%Y-%m-%d %h:%i %p')))/3600));INSERT INTO recibos(usuario_id,zona_id,hora,obra_id,camion_id,metodo,hora_edicion,razon) SELECT pipas_viajes.usuario_id,pipas_viajes.zona_id,pipas_viajes.entrada,usuarios.obra_id,pipas_viajes.camion_id,'M' as metodo,'"+hora_edicion+"' as hora_edicion,"+razon+" as razon FROM pipas_viajes JOIN usuarios ON pipas_viajes.usuario_id = usuarios.id_usuario WHERE viaje_id=(SELECT viaje_id FROM pipas_viajes WHERE camion_id = "+camion_id+" ORDER BY viaje_id DESC LIMIT 1);SELECT pipas_viajes.entrada,pipas_viajes.material_id,pipas_viajes.flete_id,pipas_viajes.zona_id,materiales.concepto,pipas_viajes.salida,materiales.unidad as unidad_material,camiones.unidad_camion,camiones.capacidad,pipas_viajes.horas,fletes.unidad as unidad_flete,fletes.precio as precio_flete,materiales.proveedor_id as banco_id,materiales.precio as precio_material FROM pipas_viajes JOIN camiones ON pipas_viajes.camion_id = camiones.camion_id JOIN materiales ON materiales.id = pipas_viajes.material_id LEFT JOIN fletes ON fletes.fletes_id = pipas_viajes.flete_id WHERE viaje_id=(SELECT viaje_id FROM pipas_viajes WHERE camion_id = "+camion_id+" ORDER BY viaje_id DESC LIMIT 1);";
} else {
  viajequery ='UPDATE pipas_viajes SET salida ="'+salida+'", horas = (time_to_sec(timediff( STR_TO_DATE("'+hora_recibo+'", "%Y-%m-%d %h:%i %p"),STR_TO_DATE(pipas_viajes.entrada, "%Y-%m-%d %h:%i %p")))/3600), acarreo = "Y" WHERE viaje_id ='+viaje_id+';INSERT INTO recibos(usuario_id,zona_id,hora,obra_id,camion_id,metodo,hora_edicion,razon) SELECT pipas_viajes.usuario_id,pipas_viajes.zona_id,pipas_viajes.entrada,usuarios.obra_id,pipas_viajes.camion_id,"M" as metodo,"'+hora_edicion+'" as hora_edicion,'+razon+' as razon FROM pipas_viajes JOIN usuarios ON pipas_viajes.usuario_id = usuarios.id_usuario WHERE viaje_id = '+viaje_id+';SELECT pipas_viajes.entrada,pipas_viajes.material_id,pipas_viajes.flete_id,pipas_viajes.zona_id,materiales.concepto,pipas_viajes.salida,materiales.unidad as unidad_material,camiones.unidad_camion,camiones.capacidad,pipas_viajes.horas,fletes.unidad as unidad_flete,fletes.precio as precio_flete,materiales.proveedor_id as banco_id,materiales.precio as precio_material FROM pipas_viajes JOIN camiones ON pipas_viajes.camion_id = camiones.camion_id JOIN materiales ON materiales.id = pipas_viajes.material_id LEFT JOIN fletes ON fletes.fletes_id = pipas_viajes.flete_id WHERE viaje_id ='+viaje_id+';';
}

var query='';
  console.log(viajequery);
    db.query(viajequery, function(err,recibo){
      if(err){
          res.json({error:err})
      } else {

        console.log(recibo[1]);
        var recibo_id = recibo[1].insertId;
        if(recibo[2][0].flete_id){
        if(recibo[2][0].unidad_flete === 'dias'){
          if(recibo[2][0].horas < 4){
          var cantidad_flete = .5;
          } else if(recibo[2][0].horas >4){
           var cantidad_flete = 1;
          }
        } else {
           var cantidad_flete = recibo[2][0].capacidad;
        }
        var unidad_flete = recibo[2][0].unidad_flete;
        var concepto_flete = recibo[2][0].concepto;
        var total_flete = (cantidad_flete*Number(recibo[2][0].precio_flete));
        var flete_id = recibo[2][0].flete_id;
        var banco_id = recibo[2][0].banco_id;
        query = query+ 'INSERT INTO acarreos_flete(cantidad,total_flete,recibo_id,concepto_flete,flete_id,banco_id,unidad) VALUE ('+cantidad_flete+','+total_flete+','+recibo_id+','+concepto_flete+','+flete_id+','+banco_id+',"'+unidad_flete+'");';
        }
        if(recibo[2][0].material_id){
        if(recibo[2][0].unidad_material === 'dias'){
          if(recibo[2][0].horas < 4){
          var cantidad_material = .5;
          } else if(recibo[2][0].horas >4){
           var cantidad_material = 1;
          }
        } else {
           var cantidad_material = recibo[2][0].capacidad;
        }
        var concepto_material = recibo[2][0].concepto;
        var total_material = (cantidad_material*Number(recibo[2][0].precio_material));
        var material_id = recibo[2][0].material_id;
        var banco_id = recibo[2][0].banco_id;
        var unidad_material = recibo[2][0].unidad_material;
        query =query+'INSERT INTO acarreos_material(material_id,cantidad,total_material,concepto_material,recibo_id,banco_id,unidad) VALUE ('+material_id+','+cantidad_material+','+total_material+','+concepto_material+','+recibo_id+','+banco_id+',"'+unidad_material+'");';
              console.log(query);
        }
        console.log(query)

            db.query(query, function(err, recibos){
              console.log(recibos)
              if(err) {
                console.log(err)
                res.send(err)
                }
                 else {
                res.json({status:'success'})
              }
            });

      }
    })
  })

router.post('/aprobar',isLoggedIn, function(req, res, err ){
 console.log(req.body)
  var acarreos = req.body.acarreos;
  acarreos = acarreos.join(", ");
    var aprobarAcarreos = 'UPDATE recibos SET aprobado = "Y" WHERE recibo_id IN ('+acarreos+');';
          db.query(aprobarAcarreos, function(err,response){
            if(err){
              res.json({error:err})
            }
            res.json({status:'success'})
          })
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

router.put('/editar', function(req,res,err){
  var recibo_id=req.body.recibo_id;
    var zona_id=req.body.zona_id;
    var estimacion_id=req.body.estimacion_id;
  var editarRecibo = 'UPDATE recibos SET zona_id = '+zona_id+' WHERE recibo_id ='+recibo_id+';SET @acarreo_mat := (SELECT acarreos_mat_id FROM acarreos_material WHERE recibo_id = '+recibo_id+' LIMIT 1);UPDATE acarreos_material SET estimacion = "Y", estimacion_id = '+estimacion_id+' WHERE acarreos_mat_id = @acarreo_mat;SET @acarreo_flete := (SELECT acarreo_id FROM acarreos_flete WHERE recibo_id = '+recibo_id+' LIMIT 1);UPDATE acarreos_flete SET estimacion = "Y", estimacion_id = '+estimacion_id+' WHERE acarreo_id = @acarreo_flete;';

    db.query(editarRecibo, function(err, recibo){
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/acarreos/update');
    }
  });
})

router.get('/ediciones', function(req,res,err){
  var fecha=req.query.fecha;
    var camion_id=req.query.camion_id;
    console.log(checkEdiciones)
  var checkEdiciones = 'SELECT COUNT(*) as ediciones FROM recibos WHERE hora BETWEEN "'+fecha+' 00:00" AND "'+fecha+' 23:59" AND metodo = "M" AND camion_id='+camion_id;

    db.query(checkEdiciones, function(err, ediciones){
    if(err) throw err;
    else {
        console.log('Listo');
        res.send(ediciones);
    }
  });
})

module.exports = router;
