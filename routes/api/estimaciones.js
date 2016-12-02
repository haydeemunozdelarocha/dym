var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');
var moment= require('moment');
var request = require('request');

var nuevaEstimacion = 'INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,residente,proveedor_id,numero,concepto,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer,precio_unitario,importe,subtotal,iva,retencion,total) VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
var listaEstimaciones = 'SELECT * FROM estimaciones';
var path = 'http://localhost:3000';

//agregar estimacion de flete
router.post('/nueva', function(req,res, next){
console.log(req.body)
var acarreos = req.body.acarreos;
var categoria = req.body.categoria;
var obra = req.body.obra;
acarreos = acarreos.toString();
var date = Date.now();
var fecha = moment(date).format("YYYY-MM-DD HH:mm");
var periodo_inicio = moment(req.body.periodo_inicio).format("YYYY-MM-DD HH:mm");
var periodo_final = moment(req.body.periodo_final).format("YYYY-MM-DD HH:mm");
var proveedor_id = Number(req.body.proveedor);
var residente = 1;
var cantidad_presupuestada;
var concepto_id;
var unidad;
var estimacion_id;
var acumulado_actual;
var acumulado_anterior;
var por_ejercer;
var presupuesto_id;
var subtotal;
var iva;
var retencion;
var total;
var buscarAcarreos = 'SELECT acarreos.camion_id, acarreos.concepto_flete, camiones.precio_flete, sum(total) AS total_concepto, sum(cantidad) AS total_cantidad FROM acarreos JOIN camiones ON acarreos.camion_id=camiones.camion_id WHERE acarreo_id IN '+acarreos+' GROUP BY concepto_flete';
var nuevaEstimacion = 'INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,residente,proveedor_id,numero) VALUE(?,?,?,?,?,?,?)';
var getNumeroEstimacion = 'SELECT * FROM estimaciones WHERE obra = ? ORDER BY fecha DESC';
var changeAcumulado = 'UPDATE presupuestos SET acumulado = ? WHERE presupuestos_id = ?';
  db.query(getNumeroEstimacion,[obra], function(err,estimaciones){
      if(err) throw err;
      else {
            if (estimaciones.length > 0){
              numero = estimaciones[0].numero + 1;
            } else if (estimaciones.length == 0){
              numero = 1;
            }
          db.query(nuevaEstimacion,[obra,fecha,periodo_inicio,periodo_final,residente,proveedor_id,numero], function(err,estimacion){
            if(err) throw err;
            else {
              console.log(estimacion.insertId);
              estimacion_id = estimacion.insertId;
              console.log('Estimacion creada exitosamente!');
              db.query(buscarAcarreos, function(err,acarreos){
                if(err) throw err;
                else {
                    for (var i = 0; i < acarreos.length ; i ++){
                          console.log(i)
                          console.log(acarreos[i])
                          importe = acarreos[i].total_concepto
                          concepto_id = acarreos[i].concepto_flete;
                          esta_estimacion = acarreos[i].total_cantidad
                          precio_unitario = acarreos[i].precio_flete;
                          request(''+path+'/api/presupuestos/'+obra+'/'+concepto_id, function (error, response, body) {
                              if (!error && response.statusCode == 200) {
                                body = JSON.parse(body);
                                console.log(body[0])
                                 presupuesto_id = body[0].presupuestos_id;
                                 cantidad_presupuestada = body[0].total;
                                 acumulado_anterior = body[0].acumulado;
                                 if (acumulado_anterior == null ){
                                  acumulado_anterior = 0;
                                 }
                                 acumulado_actual = acumulado_anterior + esta_estimacion
                                 por_ejercer = cantidad_presupuestada -esta_estimacion
                                 var articulo = {
                                            concepto_id: concepto_id,
                                            unidad:unidad,
                                            presupuesto_id: presupuesto_id,
                                            cantidad_presupuestada: cantidad_presupuestada,
                                            acumulado_anterior: acumulado_anterior,
                                            acumulado_actual:
                                            acumulado_actual,
                                            esta_estimacion: esta_estimacion,
                                            por_ejercer: por_ejercer,
                                            precio_unitario:precio_unitario,
                                            importe:importe,
                                            estimacion_id:estimacion_id
                                           };
                                  request.post({
                                          url: 'http://localhost:3000/api/estimaciones/articulos',
                                           form: articulo
                                           }, function(error, response, body){
                                              console.log(body);
                                      });
                              } else{
                                console.log(error)
                              }
                            })
                    }
                    console.log('out of loop')
                    }//else loop
                      //
                  res.redirect('/api/estimaciones/sumar/'+estimacion_id)
                });
              }
          });
      }
    });
})

router.post('/articulos', function(req,res,err){
  var concepto_id = req.body.concepto_id;
  var unidad = req.body.unidad;
  var cantidad_presupuestada = req.body.cantidad_presupuestada;
  var esta_estimacion = req.body.esta_estimacion;
  var acumulado_anterior = req.body.acumulado_anterior;
  var acumulado_actual = req.body.acumulado_actual;
  var por_ejercer = req.body.por_ejercer;
  var precio_unitario = req.body.precio_unitario;
  var importe = req.body.importe;
  var estimacion_id = req.body.estimacion_id;
  var presupuesto_id = req.body.presupuesto_id;
  var nuevoArticuloEstimacion = 'INSERT INTO estimacion_articulo(concepto_id,unidad,cantidad_presupuestada,esta_estimacion,acumulado_anterior,acumulado_actual,por_ejercer,precio_unitario,importe,estimacion_id) VALUE(?,?,?,?,?,?,?,?,?,?); UPDATE presupuestos SET acumulado = ? WHERE presupuestos_id = ?';
  console.log(nuevoArticuloEstimacion)
  db.query(nuevoArticuloEstimacion,[concepto_id,unidad,cantidad_presupuestada,esta_estimacion,acumulado_anterior,acumulado_actual,por_ejercer,precio_unitario,importe,estimacion_id, acumulado_actual, presupuesto_id], function(err,articulo){
    if (err) throw err;
    else {
      console.log(acumulado_actual)
      res.send(estimacion_id)
    }
  })
})


router.get('/sumar/:id', function(req,res,err){
  var estimacion_id = req.params.id;
  var sumarConceptos = 'SELECT sum(importe) AS subtotal FROM estimacion_articulo WHERE estimacion_id = ? GROUP BY estimacion_articulo.concepto_id';
  var updateTotals = 'UPDATE estimaciones SET subtotal = ?, iva = ?, retencion = ?, total = ? WHERE estimaciones_id = ?';
        db.query(sumarConceptos,[estimacion_id],function(err,totales){
          if(err) throw err;
          else {
              subtotal = Number(totales[0].subtotal);
              retencion = subtotal * .4;
              iva = (subtotal-retencion) * .16;
              total = subtotal - retencion + iva;
              db.query(updateTotals,[subtotal, iva,retencion,total,estimacion_id],function(err,totales){
                  if(err) throw err;
                  else {
                    res.send(estimacion_id)
                  }
              });
          }
    });
})

//Read table.
router.get('/', function(err,res){
    db.query(listaEstimaciones, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})



module.exports = router;
