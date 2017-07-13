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

// var textSched = later.parse.text('at 5:59am every sunday');

// var timer = later.setTimeout(getEstimaciones, textSched);

// var timer2 = later.setInterval(getEstimaciones, textSched);
//   timer2.clear();

var path = 'http://dymingenieros.herokuapp.com/';
var numero;

router.get('/prueba', function(req,res,err){

// function getEstimaciones(){
  console.log('gettin estimaciones');
  var today = new Date();
  var date = new Date();
  // var laterDate = new Date(date.setDate(date.getDate() - 7));
  // var timezone = "America/Mexico_City";
  // var date1= moment.tz(laterDate,timezone).format("YYYY-MM-DD");
  // var date2= moment.tz(today,timezone).format("YYYY-MM-DD");
  // date1 = date1 + ' 23:59';
  // date2 = date2 +' 23:59';
  var date1 = '2017-06-25 23:59';;
  var date2 = '2017-07-02 23:59';
  var obra_id = 452;
  var resultados;
  var rounds = 0;
  console.log(date1);
  console.log(date2);
  var getProveedores = "SELECT fletes.proveedor_id,concepto_flete AS concepto,(SELECT CASE WHEN (SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) IS NULL THEN (COALESCE((SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1),1)) ELSE (SELECT SUM((SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) + 1)) END) AS numero FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id JOIN proveedores ON proveedores.id = fletes.proveedor_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND acarreos_flete.estimacion != 'Y' OR acarreos_flete.estimacion IS NULL GROUP BY proveedor_id,concepto_flete UNION SELECT materiales.proveedor_id,concepto_material AS concepto,(SELECT CASE WHEN (SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) IS NULL THEN (COALESCE((SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1),1)) ELSE (SELECT SUM((SELECT estimaciones.numero FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) + 1)) END) AS numero FROM recibos LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN materiales ON materiales.id = acarreos_material.material_id JOIN proveedores ON proveedores.id = acarreos_material.banco_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_material.concepto_material AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND acarreos_material.estimacion != 'Y' OR acarreos_material.estimacion IS NULL GROUP BY proveedor_id,concepto_material;";
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
        // rows = JSON.parse(rows);
          async.eachSeries(rows, function (row, callback){
            console.log(row.proveedor_id)
            if(!row.proveedor_id){
              console.log('no proveedor');
              var proveedor_id = 0;
              return callback(null);
            }
            console.log(row.proveedor_id)
            var proveedor_id = row.proveedor_id;
            var numero = row.numero;
            var concepto = row.concepto;
            var nuevaEstimacion = "INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,proveedor_id,numero) VALUES ("+obra_id+",'"+fecha+"','"+date1+"','"+date2+"',(SELECT proveedores.id FROM proveedores WHERE id = "+proveedor_id+"),"+numero+");INSERT INTO estimacion_articulo(categoria,cantidad_presupuestada,acumulado_anterior,acumulado_actual,precio_unitario,concepto_id,zona_id,esta_estimacion,unidad,importe,por_ejercer,estimacion_id) SELECT 'fletes' AS categoria,COALESCE(presupuestos.cantidad,0) AS cantidad_presupuestada,COALESCE(presupuestos.acumulado,0) AS acumulado_anterior,COALESCE((presupuestos.acumulado+(SUM(acarreos_flete.cantidad))),0) AS acumulado_actual,fletes.precio AS precio_unitario,(select conceptos.conceptos_id from conceptos where conceptos_id = acarreos_flete.concepto_flete) AS concepto_id,(select zonas.zonas_id from zonas where zonas_id = recibos.zona_id) AS zona_id,SUM(acarreos_flete.cantidad) AS esta_estimacion,acarreos_flete.unidad, SUM((acarreos_flete.cantidad*fletes.precio)) AS importe,COALESCE((presupuestos.cantidad-(presupuestos.acumulado+SUM(acarreos_flete.cantidad))),0) AS por_ejercer,(SELECT estimaciones.estimaciones_id FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) AS estimacion_id FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id JOIN proveedores ON proveedores.id = fletes.proveedor_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND fletes.proveedor_id = "+proveedor_id+" AND concepto_flete ="+concepto+" GROUP BY nombre_concepto,nombre_zona UNION SELECT 'material' AS categoria,COALESCE(presupuestos.cantidad,0) AS cantidad_presupuestada,COALESCE(presupuestos.acumulado,0) AS acumulado_anterior,COALESCE((presupuestos.acumulado+(SUM(acarreos_material.cantidad))),0) AS acumulado_actual,materiales.precio AS precio_unitario,(select conceptos.conceptos_id from conceptos where conceptos_id = acarreos_material.concepto_material) AS concepto_id,(select zonas.zonas_id from zonas where zonas_id = recibos.zona_id) AS zona_id,SUM(acarreos_material.cantidad) AS esta_estimacion,acarreos_material.unidad,SUM((acarreos_material.cantidad*materiales.precio)) AS importe,COALESCE((presupuestos.cantidad-(presupuestos.acumulado+SUM(acarreos_material.cantidad))),0) AS por_ejercer,(SELECT estimaciones.estimaciones_id FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) AS estimacion_id FROM recibos LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN materiales ON materiales.id = acarreos_material.material_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_material.concepto_material AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND materiales.proveedor_id = "+proveedor_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND concepto_material ="+concepto+" GROUP BY nombre_concepto,nombre_zona; UPDATE estimaciones t4,(SELECT estimacion_id,(SUM(CASE WHEN categoria = 'fletes' THEN importe ELSE 0 END)*.04) AS retencion,importe AS subtotal,(importe*.16) AS iva,(SUM(importe)-(SUM(CASE WHEN categoria = 'fletes' THEN importe ELSE 0 END)*.04) + (importe*.16)) AS total FROM estimacion_articulo WHERE estimacion_id = (SELECT estimaciones.estimaciones_id FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1)) t1 SET t4.proceso = 'pendiente',t4.retencion = t1.retencion,t4.subtotal = t1.subtotal,t4.iva = t1.iva,t4.total = t1.total WHERE t4.estimaciones_id = t1.estimacion_id;UPDATE acarreos_flete t2,(   SELECT acarreos_flete.acarreo_id As acarreo_id FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id JOIN proveedores ON proveedores.id = fletes.proveedor_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND fletes.proveedor_id = "+proveedor_id+" AND concepto_flete = "+concepto+" ) t1 SET t2.estimacion = 'Y', t2.estimacion_id = (SELECT estimaciones.estimaciones_id FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) WHERE t2.acarreo_id = t1.acarreo_id;UPDATE acarreos_material t2, (   SELECT acarreos_material.acarreos_mat_id AS acarreo_id FROM recibos LEFT JOIN acarreos_material ON recibos.recibo_id = acarreos_material.recibo_id LEFT JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id LEFT JOIN zonas ON zonas.zonas_id = recibos.zona_id LEFT JOIN materiales ON materiales.id = acarreos_material.material_id LEFT JOIN proveedores ON proveedores.id = acarreos_material.banco_id LEFT JOIN presupuestos ON presupuestos.zona = recibos.zona_id AND presupuestos.concepto = acarreos_material.concepto_material AND presupuestos.obra = recibos.obra_id WHERE recibos.obra_id = "+obra_id+" AND materiales.proveedor_id = "+proveedor_id+" AND recibos.hora BETWEEN '"+date1+"' AND '"+date2+"' AND concepto_material = "+concepto+") t1 SET t2.estimacion = 'Y',t2.estimacion_id = (SELECT estimaciones.estimaciones_id FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1) WHERE t2.acarreos_mat_id = t1.acarreo_id;";
            console.log(nuevaEstimacion)
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
})


//Read table.
router.get('/', function(req,res,err){
  console.log('getting request');
  var listaEstimaciones = 'SELECT * FROM estimaciones;'
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
  var listaEstimaciones = 'SELECT * FROM estimaciones WHERE proceso = "por autorizar"';
    db.query(listaEstimaciones, function(err, rows){
    if(err) throw err;
    else {
      console.log(rows)
        res.json(rows);
    }
  });
})


router.post('/precio/:articuloid/:estimacionid/:conceptoid', function(req,res,err){
  var articulo_id = req.params.articuloid;
  var estimacion_id = req.params.estimacionid;
  var precio = req.body.precio;
  console.log('changing precio')
  var listaEstimaciones = 'UPDATE estimacion_articulo SET precio_unitario = '+precio+', importe = (esta_estimacion * '+precio+') WHERE articulo_id = '+articulo_id+';UPDATE estimaciones t4,(SELECT estimacion_id,(SUM(CASE WHEN categoria = "fletes" THEN importe ELSE 0 END)*.04) AS retencion,importe AS subtotal,(importe*.16) AS iva,(SUM(importe)-(SUM(CASE WHEN categoria = "fletes" THEN importe ELSE 0 END)*.04) + (importe*.16)) AS total FROM estimacion_articulo WHERE estimacion_id = '+estimacion_id+') t1 SET t4.retencion = t1.retencion,t4.subtotal = t1.subtotal,t4.iva = t1.iva,t4.total = t1.total WHERE t4.estimaciones_id = t1.estimacion_id;';

console.log(listaEstimaciones)
    db.query(listaEstimaciones, function(err, rows){
    if(err) throw err;
    else {
        res.json({done:true});
    }
  });
})

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
  var borrarEstimacion = 'UPDATE acarreos_flete SET estimacion = "N" WHERE estimacion_id = ?; UPDATE acarreos_material SET estimacion = "N" WHERE estimacion_id = ?; DELETE FROM estimaciones WHERE estimaciones_id = ?;';
  db.query(borrarEstimacion,[estimaciones_id, estimaciones_id,estimaciones_id], function(err,estimacion){
    if(err) throw err;
    else {
        console.log('Esta estimación ha sido cancelada');
        res.redirect('/estimaciones');
    }
  });
})

module.exports = router;
