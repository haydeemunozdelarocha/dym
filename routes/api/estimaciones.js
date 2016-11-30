var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');
var moment= require('moment');

var nuevaEstimacion = 'INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,residente,proveedor,numero,concepto,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer,precio_unitario,importe,subtotal,iva,retencion,total) VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
var listaEstimaciones = 'SELECT * FROM estimaciones';


router.post('/', function(req,res, next){
console.log(req.body)
var obra;
var date= Date.now();
var fecha = moment(date).format("DD/MM/YYYY HH:mm A");
var periodo_inicio= req.body.periodo_inicio;
var periodo_final= req.body.periodo_final;
var residente= req.body.residente;
var proveedor= req.body.proveedor;
var numero= req.body.numero;
var concepto= req.body.concepto;
var unidad= req.body.unidad;
var cantidad_presupuestada= req.body.cantidad_presupuestada;
var acumulado_anterior= req.body.acumulado_anterior;
var acumulado_actual= req.body.acumulado_actual;
var por_ejercer= req.body.por_ejercer;
var precio_unitario= req.body.precio_unitario;
var importe= req.body.importe;
var subtotal= req.body.subtotal;
var iva= req.body.iva;
var retencion= req.body.retencion;
var total= req.body.total;
  db.query(nuevaEstimacion,[obra,fecha,periodo_inicio,periodo_final,residente,proveedor,numero,concepto,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer,precio_unitario,importe,subtotal,iva,retencion,total], function(err,estimacion){
      if(err) throw err;
      else {
          res.send(estimacion);
      }
    });
})
//agregar estimacion de flete
router.post('/nueva', function(req,res, next){
console.log('nueva estimacion')
var acarreos = req.body.acarreos;
var categoria = req.body.categoria;
var obra = req.body.obra;
acarreos = acarreos.toString();
var date = Date.now();
var fecha = moment(date).format("DD/MM/YYYY HH:mm A");
var periodo_inicio = req.body.periodo_inicio;
var periodo_final = req.body.periodo_final;
var proveedor = req.body.proveedor;
var residente = 1;
var cantidad_presupuestada;
var concepto_id;
var unidad;
var estimacion_id;
var acumulado_actual;
var acumulado_anterior;
var por_ejercer;
var presupuestos_ids = [];
var subtotal;
var iva;
var retencion;
var total;
var buscarAcarreos = 'SELECT acarreos.camion_id, acarreos.acarreo_id,camiones.precio_flete, sum(total) AS total_concepto, sum(cantidad) AS total_cantidad FROM acarreos JOIN camiones ON acarreos.camion_id=camiones.camion_id WHERE acarreo_id IN ('+acarreos+') GROUP BY camion_id';
var sumarAcarreos = 'SELECT acarreos.*,materiales.*, sum(total) FROM acarreos JOIN materiales ON acarreos.material_id=materiales.id WHERE acarreo_id IN ('+acarreos+') GROUP BY materiales.concepto';
var nuevaEstimacion = 'INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,residente,proveedor,numero) VALUE(?,?,?,?,?,?,?)';
var getNumeroEstimacion = 'SELECT * FROM estimaciones WHERE obra = ? ORDER BY fecha DESC';
var getPresupuesto = 'SELECT * FROM presupuestos WHERE obra = ? AND concepto = ?';
var nuevoArticuloEstimacion = 'INSERT INTO estimacion_articulo(concepto_id,unidad,cantidad_presupuestada,esta_estimacion,acumulado_anterior,acumulado_actual,por_ejercer,precio_unitario,importe,estimacion_id) VALUE(?,?,?,?,?,?,?,?,?,?)';
var changeAcumulado = 'UPDATE presupuestos SET acumulado = ? WHERE presupuestos_id IN (?)';
var sumarConceptos = 'SELECT sum(importe) AS subtotal FROM estimacion_articulo WHERE estimacion_id = ? GROUP BY estimacion_articulo.concepto_id';
var updateTotals = 'UPDATE estimaciones SET subtotal = ?, iva = ?, retencion = ?, total = ? WHERE estimaciones_id = ?'
  db.query(getNumeroEstimacion,[obra], function(err,estimaciones){
      if(err) throw err;
      else {
            if (estimaciones.length > 0){
              numero = estimaciones[0].numero + 1;
            } else if (estimaciones.length == 0){
              numero = 1;
            }
          db.query(nuevaEstimacion,[obra,fecha,periodo_inicio,periodo_final,residente,proveedor,numero], function(err,estimacion){
            if(err) throw err;
            else {
              console.log(estimacion.insertId);
              estimacion_id = estimacion.insertId;
              console.log('Estimacion creada exitosamente!');
              db.query(buscarAcarreos, function(err,acarreos){
                if(err) throw err;
                else {
                    concepto_id = 82;
                    for (var i = 0; i < acarreos.length ; i ++){
                      importe = acarreos[i].total_concepto
                      esta_estimacion = acarreos[i].total_cantidad
                      precio_unitario = acarreos[i].precio_flete
                      db.query(getPresupuesto,[obra,concepto_id],function(err,presupuesto){
                          if(err) throw err;
                          else {
                            presupuestos_ids = presupuestos_ids.push(presupuesto[i].presupuestos_id);
                             cantidad_presupuestada = presupuesto[0].total;
                             acumulado_anterior = presupuesto[0].acumulado;
                             if (acumulado_anterior == null ){
                              acumulado_anterior = 0;
                             }
                             acumulado_actual = acumulado_anterior + esta_estimacion
                             por_ejercer = cantidad_presupuestada -esta_estimacion
                          db.query(nuevoArticuloEstimacion,[concepto_id,unidad,cantidad_presupuestada,esta_estimacion,acumulado_anterior,acumulado_actual,por_ejercer,precio_unitario,importe,estimacion_id],function(err,articulo){
                          if(err) throw err;
                          else {
                            db.query(changeAcumulado,[acumulado_actual, presupuestos_ids],function(err,presupuesto){
                          if(err) throw err;
                          else {
                              console.log(presupuesto)
                                }
                              });
                          }
                        });
                          }
                        });
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
                                    res.json(estimacion_id)
                                          }
                                        });
                                      }
                                    });
                    }
                }
              });
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
