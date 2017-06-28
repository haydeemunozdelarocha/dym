var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');
var moment= require('moment');
var request = require('request');
var rp = require('request-promise');
var later = require('later');
var async = require('async');

var textSched = later.parse.text(' at 11:59pm every sunday');
var timer = later.setTimeout(getEstimaciones, textSched);
var timer2 = later.setInterval(getEstimaciones, textSched);
timer2.clear();

var path = 'http://dymingenieros.herokuapp.com/';
var numero;


function getEstimaciones(){
  console.log('gettin estimaciones');
  var today = new Date();
  var date = new Date();
  var laterDate = new Date(date.setDate(date.getDate() - 7));
  var date1 =  moment(laterDate).format("YYYY-MM-DD HH:MM");
  var date2 = moment(today).format("YYYY-MM-DD HH:MM");
  var obra_id = 452;
  var resultados;
  var rounds = 0;
  console.log(date1);
  console.log(date2);
  var getProveedores = "SELECT fletes.proveedor_id FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id JOIN proveedores ON proveedores.id = fletes.proveedor_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND acarreos_flete.estimacion != 'Y' OR acarreos_flete.estimacion IS NULL GROUP BY proveedor_id UNION SELECT materiales.proveedor_id FROM recibos LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN materiales ON materiales.id = acarreos_material.material_id JOIN proveedores ON proveedores.id = acarreos_material.banco_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_material.concepto_material AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND acarreos_material.estimacion != 'Y' OR acarreos_material.estimacion IS NULL GROUP BY proveedor_id;";
  console.log(getProveedores)
  db.query(getProveedores, function(err, rows){
    if(err) {
      console.log(err)
    }
    else {
      if(!rows[0].proveedor_id && rows.length == 1){
      console.log('No hay acarreos sin estimacion para esta semana.');

      } else {
        console.log('---------')
        var date = Date.now();
        var fecha= moment(date).format("YYYY-MM-DD");
              console.log(rows)
          //terminar loop
          async.eachSeries(rows, function (row, callback){
            if(!row.proveedor_id){
              console.log('no proveedor');
              var proveedor_id = 0;
              return callback(null);
            }
            console.log(row.proveedor_id)
            var proveedor_id = row.proveedor_id;
            var nuevaEstimacion = "DROP TEMPORARY TABLE IF EXISTS numero_table;CREATE TEMPORARY TABLE IF NOT EXISTS numero_table AS (SELECT CASE WHEN (SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) IS NULL THEN (COALESCE((SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1),1)) ELSE (SELECT SUM((SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) + 1)) END AS numero);INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,proveedor_id,numero) VALUES ("+obra_id+",'"+fecha+"','"+date1+"','"+date2+"',(SELECT proveedores.id FROM proveedores WHERE id = "+proveedor_id+"),(SELECT * FROM numero_table ORDER BY numero DESC LIMIT 1));INSERT INTO estimacion_articulo(cantidad_presupuestada,acumulado_anterior,acumulado_actual,precio_unitario,concepto_id,zona_id,esta_estimacion,unidad,importe,por_ejercer,estimacion_id) SELECT COALESCE(presupuestos.cantidad,0) AS cantidad_presupuestada,COALESCE(presupuestos.acumulado,0) AS acumulado_anterior,COALESCE((presupuestos.acumulado+(SUM(acarreos_flete.cantidad))),0) AS acumulado_actual,fletes.precio AS precio_unitario,(select conceptos.conceptos_id from conceptos where conceptos_id = acarreos_flete.concepto_flete) AS concepto_id,(select zonas.zonas_id from zonas where zonas_id = recibos.zona_id) AS zona_id,SUM(acarreos_flete.cantidad) AS esta_estimacion,acarreos_flete.unidad, SUM(total_flete) AS importe,COALESCE((presupuestos.cantidad-(presupuestos.acumulado+SUM(acarreos_flete.cantidad))),0) AS por_ejercer,(SELECT estimaciones.estimaciones_id FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) AS estimacion_id FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id JOIN proveedores ON proveedores.id = fletes.proveedor_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND fletes.proveedor_id = "+proveedor_id+" GROUP BY nombre_concepto,nombre_zona UNION SELECT COALESCE(presupuestos.cantidad,0) AS cantidad_presupuestada,COALESCE(presupuestos.acumulado,0) AS acumulado_anterior,COALESCE((presupuestos.acumulado+(SUM(acarreos_material.cantidad))),0) AS acumulado_actual,materiales.precio AS precio_unitario,(select conceptos.conceptos_id from conceptos where conceptos_id = acarreos_material.concepto_material) AS concepto_id,(select zonas.zonas_id from zonas where zonas_id = recibos.zona_id) AS zona_id,SUM(acarreos_material.cantidad) AS esta_estimacion,acarreos_material.unidad,SUM(total_material) AS importe,COALESCE((presupuestos.cantidad-(presupuestos.acumulado+SUM(acarreos_material.cantidad))),0) AS por_ejercer,(SELECT estimaciones.estimaciones_id FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) AS estimacion_id FROM recibos LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN materiales ON materiales.id = acarreos_material.material_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_material.concepto_material AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND materiales.proveedor_id = "+proveedor_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' GROUP BY nombre_concepto,nombre_zona;UPDATE estimaciones t4,(SELECT estimacion_id,(SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END)*.4) AS retencion,(SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END) - (SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END)*.4) + SUM(CASE WHEN concepto_id != 92 || concepto_id != 82 THEN importe ELSE 0 END)) AS subtotal,((SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END) - (SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END)*.4) + SUM(CASE WHEN concepto_id != 92 || concepto_id != 82 THEN importe ELSE 0 END))*.16) AS iva,(((SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END) - (SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END)*.4) + SUM(CASE WHEN concepto_id != 92 || concepto_id != 82 THEN importe ELSE 0 END))*.16)+SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END) - (SUM(CASE WHEN concepto_id = 92 || concepto_id = 82 THEN importe ELSE 0 END)*.4) + SUM(CASE WHEN concepto_id != 92 || concepto_id != 82 THEN importe ELSE 0 END)) AS total FROM estimacion_articulo WHERE estimacion_id = (SELECT estimaciones.estimaciones_id FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1)) t1 SET t4.proceso = 'pendiente',t4.retencion = t1.retencion,t4.subtotal = t1.subtotal,t4.iva = t1.iva,t4.total = t1.total WHERE t4.estimaciones_id = t1.estimacion_id;UPDATE acarreos_flete t2,(   SELECT acarreos_flete.acarreo_id As acarreo_id FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id JOIN proveedores ON proveedores.id = fletes.proveedor_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND fletes.proveedor_id = "+proveedor_id+" ) t1 SET t2.estimacion = 'Y' WHERE t2.acarreo_id = t1.acarreo_id;UPDATE acarreos_material t2, (   SELECT acarreos_material.acarreos_mat_id AS acarreo_id FROM recibos LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN materiales ON materiales.id = acarreos_material.material_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_material.concepto_material AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND materiales.proveedor_id = "+proveedor_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' ) t1 SET t2.estimacion = 'Y' WHERE t2.acarreos_mat_id = t1.acarreo_id;";

            db.query(nuevaEstimacion, function(err, rows){
                if(!err) {
                console.log(rows[0])
                callback();
                } else {
                console.log(err.code +" : No se pudo guardar la estimacion del proveedor " + proveedor_id);
                console.log("Error al guardar la estimacion");
                 callback(null);
                }
              })
          }, function(err) {
            if(err){
              console.log(err)
            } else {
                //whatever you wanna do after all the iterations are done
                console.log('before update')
                    var update = "UPDATE presupuestos t4,( SELECT presupuestos.presupuestos_id,(case when acarreos_flete.concepto_flete = 82 then SUM(acarreos_flete.cantidad) else SUM(acarreos_material.cantidad) end) AS acumulado FROM recibos LEFT JOIN acarreos_flete ON acarreos_flete.recibo_id = recibos.recibo_id LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete OR acarreos_material.concepto_material= conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN presupuestos ON presupuestos.concepto = (case when acarreos_flete.concepto_flete then acarreos_flete.concepto_flete else acarreos_material.concepto_material end) AND presupuestos.zona = recibos.zona_id WHERE recibos.obra_id = "+obra_id+" AND presupuestos.obra = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' GROUP BY nombre_concepto,nombre_zona ) t1 SET t4.acumulado = t1.acumulado WHERE t4.presupuestos_id = t1.presupuestos_id;";
                    db.query(update, function(err, rows){
                      if(!err) {
                         console.log('done');
                      } else {
                        console.log(err);
                        console.log("Error al actualizar el presupuesto");
                      }
                    })
            }
        });

    }
  }
})
}


//Read table.
router.get('/', function(req,res,err){
  console.log('getting request')
    db.query(listaEstimaciones, function(err, rows){
    if(err) throw err;
    else {
      console.log(rows)
        res.json(rows);
    }
  });
})

router.get('/autorizacion/costos', function(req,res,err){
  console.log('getting request')
  var listaEstimaciones = 'SELECT * FROM estimaciones WHERE status = "por autorizar"';
    db.query(listaEstimaciones, function(err, rows){
    if(err) throw err;
    else {
      console.log(rows)
        res.json(rows);
    }
  });
})

// router.post('/', function(req,res,err) {
//   console.log('creando Estimacion')
//   var ids = req.body.acarreos;
//   var obra_id = req.user.obra_id;
//   var totales;
//   var categoria = req.body.categoria;
//   var articulos = [];
//   var estimacion_id;
//   var date = Date.now();
//   var fecha = moment(date).format("YYYY-MM-DD HH:mm");
//   var numero;
//   var status = "inicio";
//   var periodo_inicio = moment(req.body.date1).format("YYYY-MM-DD HH:mm");
//   var periodo_final = moment(req.body.date2).format("YYYY-MM-DD HH:mm");
//   var proveedor_id = req.body.proveedor_id;
//   console.log(ids)
//   console.log(categoria)
//   if(categoria === "flete"){
//      buscarAcarreos = 'SELECT acarreos_flete.concepto_flete,fletes.fletes_id, recibos.zona_id,fletes.precio,fletes.unidad,presupuestos.costo,presupuestos.total AS presupuestado,presupuestos.acumulado, sum(acarreos_flete.total_flete) AS total_concepto, sum(acarreos_flete.cantidad) AS total_cantidad, IFNULL(presupuestos_id,(SELECT presupuestos.presupuestos_id FROM presupuestos WHERE obra = 442 AND concepto = 352)) AS presupuesto FROM acarreos_flete JOIN recibos ON acarreos_flete.recibo_id = recibos.recibo_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id LEFT JOIN proveedores ON fletes.proveedor_id = proveedores.id LEFT JOIN presupuestos ON presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.zona = recibos.zona_id AND presupuestos.obra = recibos.obra_id WHERE acarreo_id IN ('+ids+') GROUP BY concepto_flete,flete_id, zona_id;';
//   } else {
//      buscarAcarreos = 'SELECT acarreos_material.concepto_material,materiales.material_id, recibos.zona_id,materiales.precio,materiales.unidad,presupuestos.costo,presupuestos.total AS presupuestado,presupuestos.acumulado, sum(acarreos_material.total_material) AS total_concepto, sum(acarreos_material.cantidad) AS total_cantidad, IFNULL(presupuestos_id,(SELECT presupuestos.presupuestos_id FROM presupuestos WHERE obra = 442 AND concepto = 352)) FROM acarreos_material JOIN recibos ON acarreos_material.recibo_id = recibos.recibo_id LEFT JOIN materiales ON acarreos_material.material_id = materiales.id LEFT JOIN proveedores ON acarreos_material.banco_id = proveedores.id LEFT JOIN presupuestos ON presupuestos.concepto = acarreos_material.concepto_material AND presupuestos.zona = recibos.zona_id AND presupuestos.obra = recibos.obra_id WHERE acarreos_mat_id IN ('+ids+') GROUP BY concepto_material,material_id, zona_id;';
//   }
//     console.log(buscarAcarreos)
//     var lastEstimacion = 'SELECT * FROM estimaciones WHERE obra ='+obra_id+' ORDER BY estimaciones_id DESC LIMIT 1;'
//       db.query(lastEstimacion).then(function(rows,err){
//         if (!rows[0]){
//           console.log("no numero")
//           console.log(rows)
//           numero = 1;
//         }else {
//           console.log('setting numero')
//           console.log(rows)
//           numero = rows[0].numero + 1;
//           console.log(numero)
//         }
//         var nuevaEstimacion = 'INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,proveedor_id,categoria,status,numero) VALUE('+obra_id+',"'+fecha+'","'+periodo_inicio+'","'+periodo_final+'",'+proveedor_id+',"'+categoria+'","'+status+'",'+numero+');';
//             console.log(nuevaEstimacion)
//         return db.query(nuevaEstimacion)
//       }).then(function(rows,err){
//             estimacion_id = rows.insertId;
//             console.log(estimacion_id)
//             if (categoria === "flete"){
//               editarAcarreosEst = 'UPDATE acarreos_flete SET estimacion_id ='+estimacion_id+' WHERE acarreo_id IN('+ids+');UPDATE acarreos_flete SET estimacion = "Y" WHERE acarreo_id IN ('+ids+');'

//             } else {
//               editarAcarreosEst = 'UPDATE acarreos_material SET estimacion_id ='+estimacion_id+' WHERE acarreos_mat_id IN('+ids+');UPDATE acarreos_material SET estimacion = "Y" WHERE acarreo_id IN ('+ids+');'
//             }
//             return db.query(editarAcarreosEst)
//       }).then(function(rows,err){
//         console.log(editarAcarreosEst)
//         return db.query(buscarAcarreos)
//       }).then( function(rows,err){
//         console.log(rows)
//         if(err) throw err;
//         else {
//           if(rows.length < 1){
//             res.send({message: "No se encontraron acarreos en esa fecha"})
//           }
//             totales = JSON.stringify(rows);
//             totales = JSON.parse(totales);
//             console.log('setting totales')
//             console.log(totales)
//             for(var i = 0; i < totales.length ; i++){
//               if(categoria === "flete"){
//                 var concepto_id = Number(totales[i].concepto_flete);
//               } else {
//                  var concepto_id = Number(totales[i].concepto);
//               }
//               var zona_id = totales[i].zona_id;
//               var esta_estimacion = Number(totales[i].total_cantidad);
//               var importe = totales[i].total_concepto;
//               var unidad = totales[i].unidad;
//               var cantidad_presupuestada = Number(totales[i].presupuestado);
//               var acumulado_anterior = Number(totales[i].acumulado);
//               var acumulado_actual = acumulado_anterior + esta_estimacion;
//               var por_ejercer = cantidad_presupuestada - acumulado_actual;
//               var precio_unitario = totales[i].precio;
//               var presupuesto_id = totales[i].presupuesto;
//               var costo_acumulado = totales[i].costo + importe;
//               console.log(costo_acumulado)

//                   var options = {
//                     method: 'POST',
//                     uri: path+'api/estimaciones/articulos',
//                     body: {
//                           concepto_id: concepto_id,
//                           esta_estimacion:esta_estimacion,
//                           precio_unitario:precio_unitario,
//                           importe: importe,
//                           estimacion_id: estimacion_id,
//                           zona_id:zona_id,
//                           unidad:unidad,
//                           cantidad_presupuestada:cantidad_presupuestada,
//                           acumulado_anterior: acumulado_anterior,
//                           acumulado_actual: acumulado_actual,
//                           por_ejercer: por_ejercer,
//                           presupuesto_id:presupuesto_id,
//                           costo_acumulado:costo_acumulado
//                     },
//                     json: true // Automatically stringifies the body to JSON
//                 };
//                 rp(options).then(function(response) {
//                   console.log(response)
//                   articulos.push(response.articulo)
//                   if (articulos.length == totales.length) {
//                     console.log(estimacion_id)
//                     var estimacionTotales = 'SELECT sum(importe) AS subtotal FROM estimacion_articulo WHERE estimacion_id = '+estimacion_id;
//                           db.query(estimacionTotales).then(function(rows,err){
//                             console.log(rows)
//                             var subtotal = Number(rows[0].subtotal);
//                             var retencion;
//                             var iva;
//                             var total;
//                             if (categoria === "flete"){
//                               console.log(categoria);
//                               retencion = subtotal * .04;
//                               retencion = retencion.toFixed(2);
//                               iva = subtotal*.16
//                               total = subtotal - retencion + iva;
//                             } else {
//                               retencion = 0;
//                               iva = subtotal * .16;
//                               total = subtotal + iva;

//                             }
//                                iva = iva.toFixed(2);
//                                total = total.toFixed(2);
//                             var updateTotals = 'UPDATE estimaciones SET subtotal ='+subtotal+',iva = '+iva+', retencion = '+retencion+', total = '+total+' WHERE estimaciones_id = '+estimacion_id+';';
//                             return db.query(updateTotals)
//                           }).then(function(rows,err){
//                             res.json({estimacion_id:estimacion_id})
//                           })
//                     }
//                 })
//             }
//           }
//     })
// })

router.get('/obra/:obraid', function(req,res,err){
  var obra_id = req.params.obraid;
  console.log('getting request')
  var listaEstimaciones = 'SELECT estimaciones.*,obras.nombre_obra,proveedores.razon_social FROM estimaciones JOIN obras ON estimaciones.obra = obras.obra_id JOIN proveedores ON estimaciones.proveedor_id = proveedores.id WHERE obra = ?;';

    db.query(listaEstimaciones,[obra_id], function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

// router.post('/articulos', function(req,res,err){
//   console.log('articulos')
//   console.log(req.body)
//  var concepto_id= req.body.concepto_id;
// var esta_estimacion = req.body.esta_estimacion;
//  var precio_unitario= req.body.precio_unitario;
//  var importe= req.body.importe;
//  var estimacion_id = req.body.estimacion_id;
//  var zona_id = req.body.zona_id;
//  var unidad = req.body.unidad;
//   var cantidad_presupuestada = req.body.cantidad_presupuestada;
//   var acumulado_anterior= req.body.acumulado_anterior;
//   var acumulado_actual= Number(req.body.acumulado_actual);
//   var costo_acumulado = req.body.costo_acumulado;
//   var por_ejercer= req.body.por_ejercer;
//   var presupuesto_id = req.body.presupuesto_id;
//   var nuevoArticuloEstimacion = 'UPDATE presupuestos SET acumulado = ?, costo = ? WHERE presupuestos_id = ?; UPDATE estimaciones SET status = "revisar" WHERE estimaciones_id = ?; INSERT INTO estimacion_articulo(concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer) VALUE(?,?,?,?,?,?,?,?,?,?,?);';
//   console.log(acumulado_actual,costo_acumulado,presupuesto_id,estimacion_id,concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer)
//   db.query(nuevoArticuloEstimacion,[acumulado_actual,costo_acumulado,presupuesto_id,estimacion_id,concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer], function(err,articulo){
//     if (err) throw err;
//     else {
//         console.log(nuevoArticuloEstimacion)
//        articulo_id = articulo[2].insertId;
//        console.log(articulo_id)
//       res.json({articulo:articulo_id})
//     }
//   })
// })


router.use(bodyParser.urlencoded({extended:true}))
router.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

router.put('/editar/:id', function(req,res,err){
  var estimacion_id=req.params.id;
  var editarEstimacion = 'UPDATE estimaciones SET obra = ?, fecha = ?, periodo_inicio = ?, periodo_final = ?, residente = ?, numero = ?, subtotal = ?, iva = ?, retencion = ?, total = ?, pagado = ?, facturas = ?, firma_residente = ?, autorizacion = ?, firma_contratista = ?, proveedor_id = ? WHERE `id`= ?';

    db.query(editarEstimacion,[obra,fecha,periodo_inicio,periodo_final,residente,numero,subtotal,iva,retencion,total,pagado,facturas,firma_residente,firma_contratista,proveedor_id,estimacion_id], function(err, material){
        console.log(editarMaterial);
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/estimaciones');
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

router.delete('/borrar/:id', function(req,res,err){
  var estimaciones_id = req.params.id;
  console.log(estimaciones_id)
  var borrarEstimacion = 'UPDATE acarreos_flete SET estimacion = "N" WHERE estimacion_id = ?; UPDATE acarreos_material SET estimacion = "N" WHERE estimacion_id = ?; UPDATE estimaciones SET status = "cancelada" WHERE estimaciones_id = ?;';
  db.query(borrarEstimacion,[estimaciones_id, estimaciones_id,estimaciones_id], function(err,estimacion){
    if(err) throw err;
    else {
        console.log('Esta estimación ha sido cancelada');
        res.redirect('/estimaciones');
    }
  });
})

module.exports = router;
