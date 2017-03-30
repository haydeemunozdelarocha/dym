var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');
var moment= require('moment');
var request = require('request');
var rp = require('request-promise');

var nuevaEstimacion = 'INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,residente,proveedor_id,numero,concepto,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer,precio_unitario,importe,subtotal,iva,retencion,total) VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
var listaEstimaciones = 'SELECT estimaciones.*,obras.nombre_obra,proveedores.razon_social FROM estimaciones JOIN obras ON estimaciones.obra = obras.obra_id JOIN proveedores ON estimaciones.proveedor_id = proveedores.id;';

var path = 'http://localhost:3000/';
var numero;

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

router.post('/', function(req,res,err) {
  console.log('creando Estimacion')
  var ids = req.body.acarreos;
  var obra_id = req.user.obra_id;
  var totales;
  var categoria = req.body.categoria;
  var articulos = [];
  var estimacion_id;
  var date = Date.now();
  var fecha = moment(date).format("YYYY-MM-DD HH:mm");
  var numero;
  var status = "inicio";
  var periodo_inicio = moment(req.body.date1).format("YYYY-MM-DD HH:mm");
  var periodo_final = moment(req.body.date2).format("YYYY-MM-DD HH:mm");
  var proveedor_id = req.body.proveedor_id;
  console.log(ids)
    var buscarAcarreos = 'SELECT acarreos.material_id,acarreos.concepto_flete,acarreos.total,acarreos.cantidad, recibos.zona_id,materiales.concepto,materiales.precio,materiales.unidad,presupuestos.presupuestos_id,presupuestos.costo,presupuestos.total AS presupuestado,presupuestos.acumulado, sum(acarreos.total) AS total_concepto, sum(acarreos.cantidad) AS total_cantidad FROM acarreos JOIN recibos ON acarreos.recibo_id = recibos.recibo_id LEFT JOIN materiales ON acarreos.material_id = materiales.id OR acarreos.concepto_flete = materiales.id LEFT JOIN presupuestos ON presupuestos.concepto = materiales.concepto AND presupuestos.zona = recibos.zona_id WHERE acarreo_id IN ('+ids+') GROUP BY concepto_flete,material_id, zona_id;';
    var lastEstimacion = 'SELECT * FROM estimaciones WHERE obra ='+obra_id+' ORDER BY estimaciones_id DESC LIMIT 1;'
      db.query(lastEstimacion).then(function(rows,err){
        numero = rows[0].numero + 1;
        var nuevaEstimacion = 'UPDATE acarreos SET estimacion = "Y" WHERE acarreo_id IN ('+ids+');INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,proveedor_id,categoria,status,numero) VALUE('+obra_id+',"'+fecha+'","'+periodo_inicio+'","'+periodo_final+'",'+proveedor_id+',"'+categoria+'","'+status+'",'+numero+');';
            console.log(nuevaEstimacion)
        return db.query(nuevaEstimacion)
      }).then(function(rows,err){
        console.log(rows[1])
        estimacion_id = rows[1].insertId;
        return db.query(buscarAcarreos)
      }).then( function(rows,err){
        if(err) throw err;
        else {
          if(rows.length < 1){
            res.send({message: "No se encontraron acarreos en esa fecha"})
          }
            totales = JSON.stringify(rows);
            totales = JSON.parse(totales);
            console.log('setting totales')
            for(var i = 0; i < totales.length ; i++){
              var concepto_id = Number(totales[i].concepto);
              var zona_id = totales[i].zona_id;
              var esta_estimacion = Number(totales[i].total_cantidad);
              var importe = totales[i].total;
              var unidad = totales[i].unidad;
              var cantidad_presupuestada = Number(totales[i].presupuestado);
              var acumulado_anterior = Number(totales[i].acumulado);
              var acumulado_actual = acumulado_anterior + esta_estimacion;
              var por_ejercer = cantidad_presupuestada - acumulado_actual;
              var precio_unitario = totales[i].precio;
              var presupuesto_id = totales[i].presupuestos_id;

                  var options = {
                    method: 'POST',
                    uri: path+'api/estimaciones/articulos',
                    body: {
                          concepto_id: concepto_id,
                          esta_estimacion:esta_estimacion,
                          precio_unitario:precio_unitario,
                          importe: importe,
                          estimacion_id: estimacion_id,
                          zona_id:zona_id,
                          unidad:unidad,
                          cantidad_presupuestada:cantidad_presupuestada,
                          acumulado_anterior: acumulado_anterior,
                          acumulado_actual: acumulado_actual,
                          por_ejercer: por_ejercer,
                          presupuesto_id:presupuesto_id
                    },
                    json: true // Automatically stringifies the body to JSON
                };
                rp(options).then(function(response) {
                  console.log(response)
                  articulos.push(response.articulo)
                  if (articulos.length == totales.length) {
                    console.log(estimacion_id)
                    var estimacionTotales = 'SELECT sum(importe) AS subtotal FROM estimacion_articulo WHERE estimacion_id = '+estimacion_id;
                          db.query(estimacionTotales).then(function(rows,err){
                            console.log(rows)
                            var subtotal = Number(rows[0].subtotal);
                            var retencion;
                            var iva;
                            var total;
                            if (categoria === "flete"){
                              console.log(categoria);
                              retencion = subtotal * .4;
                              iva = (subtotal-retencion)*.16
                              total = subtotal - retencion + iva;
                            } else {
                              iva = subtotal * .16;
                              total = subtotal + iva;
                            }
                            var updateTotals = 'UPDATE estimaciones SET subtotal ='+subtotal+',iva = '+iva+', retencion = '+retencion+', total = '+total+' WHERE estimaciones_id = '+estimacion_id+';';
                            return db.query(updateTotals)
                          }).then(function(rows,err){
                            res.json({estimacion_id:estimacion_id})
                          })
                    }
                })
            }
          }
    })
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

router.post('/articulos', function(req,res,err){
  console.log('articulos')
 var concepto_id= req.body.concepto_id;
var esta_estimacion = req.body.esta_estimacion;
 var precio_unitario= req.body.precio_unitario;
 var importe= req.body.importe;
 var estimacion_id = req.body.estimacion_id;
 var zona_id = req.body.zona_id;
 var unidad = req.body.unidad;
  var cantidad_presupuestada = req.body.cantidad_presupuestada;
  var acumulado_anterior= req.body.acumulado_anterior;
  var acumulado_actual= req.body.acumulado_actual;
  var por_ejercer= req.body.por_ejercer;
  var presupuesto_id = req.body.presupuesto_id;
  var nuevoArticuloEstimacion = 'UPDATE presupuestos SET acumulado = ? WHERE presupuestos_id = ?; UPDATE estimaciones SET status = "revision" WHERE estimaciones_id = ?; INSERT INTO estimacion_articulo(concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer) VALUE(?,?,?,?,?,?,?,?,?,?,?);';
  console.log(concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer)
  db.query(nuevoArticuloEstimacion,[acumulado_actual,presupuesto_id,estimacion_id,concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id,unidad,cantidad_presupuestada,acumulado_anterior,acumulado_actual,por_ejercer], function(err,articulo){
    if (err) throw err;
    else {
       articulo_id = articulo[2].insertId;
       console.log(articulo_id)
      res.json({articulo:articulo_id})
    }
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
  var borrarEstimacion = 'UPDATE acarreos SET estimacion = "N" WHERE estimacion_id = ?; DELETE FROM estimacion_articulo WHERE estimacion_id = ?; DELETE FROM estimaciones WHERE estimaciones_id = ?;';
  db.query(borrarEstimacion,[estimaciones_id, estimaciones_id, estimaciones_id], function(err,estimacion){
    if(err) throw err;
    else {
        console.log('Esta estimación ha sido eliminada');
        res.redirect('/estimaciones');
    }
  });
})

module.exports = router;
