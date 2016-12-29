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
var path = 'https://dymingenieros.herokuapp.com/';
var numero;

//Read table.
router.get('/', function(req,res,err){
  console.log('getting request')
    db.query(listaEstimaciones, function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
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

//agregar estimacion de flete
router.post('/nueva', function(req,res,next){
var acarreos = req.body.acarreos;
var categoria = req.body.categoria;
console.log(categoria)
var obra = req.body.obra;
var zona_id;
var date = Date.now();
var fecha = moment(date).format("YYYY-MM-DD HH:mm");
var numero;
var residente = 1;
var unidad;
var cantidad_presupuestada;
var acumulado_anterior;
var acumulado_actual;
var por_ejercer;
var importe;
var concepto_id;
var precio_unitario;
var esta_estimacion;
acarreos = acarreos.toString();
var periodo_inicio = moment(req.body.periodo_inicio).format("YYYY-MM-DD HH:mm");
var periodo_final = moment(req.body.periodo_final).format("YYYY-MM-DD HH:mm");
var proveedor_id = Number(req.body.proveedor);
var getNumeroEstimacion = 'SELECT * FROM estimaciones WHERE obra = ? ORDER BY fecha DESC';
var nuevaEstimacion = 'INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,residente,proveedor_id,numero,categoria) VALUE(?,?,?,?,?,?,?,?)';
var buscarAcarreosFlete = 'SELECT acarreos.material_id, acarreos.concepto_flete, camiones.precio_flete, recibos.zona_id, sum(total) AS total_concepto, sum(cantidad) AS total_cantidad FROM acarreos JOIN camiones ON acarreos.camion_id=camiones.camion_id JOIN recibos ON acarreos.recibo_id = recibos.recibo_id WHERE acarreo_id IN '+acarreos+' GROUP BY concepto_flete,zona_id;';
var buscarAcarreosMaterial = 'SELECT acarreos.camion_id, materiales.concepto, materiales.precio,recibos.zona_id, sum(total) AS total_concepto, sum(cantidad) AS total_cantidad FROM acarreos JOIN materiales ON acarreos.material_id=materiales.id JOIN recibos ON acarreos.recibo_id = recibos.recibo_id WHERE acarreo_id IN '+acarreos+' GROUP BY materiales.concepto,recibos.zona_id;';
var editarAcarreos = 'UPDATE acarreos SET estimacion = "Y", estimacion_id = ? WHERE acarreo_id IN '+acarreos;
var nuevoArticuloEstimacion = 'INSERT INTO estimacion_articulo(concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id) VALUE(?,?,?,?,?,?);';
 db.query(getNumeroEstimacion,[obra]).then( function(estimaciones,err){
      if(err) throw err;
      else {
            if (estimaciones.length > 0){
              console.log(estimaciones[0].numero)
              numero = estimaciones[0].numero + 1;
              console.log(numero)
            } else if (estimaciones.length == 0){
              numero = 1;
            }
            console.log(obra,fecha,periodo_inicio,periodo_final,residente,proveedor_id,numero,categoria)
            return db.query(nuevaEstimacion,[obra,fecha,periodo_inicio,periodo_final,residente,proveedor_id,numero,categoria])
      }
  }).then(function (estimacion, err){
              estimacion_id = estimacion.insertId;
              console.log('Estimacion creada exitosamente!');
              return db.query(editarAcarreos,[estimacion_id])
  }).then(function(acarreos,err){
    console.log('Acarreos editados')
    if(categoria === "flete"){
      return db.query(buscarAcarreosFlete)
    } else if (categoria === "material"){
      return db.query(buscarAcarreosMaterial)
    }
  }).then(function(acarreos,err){
    console.log(acarreos)
    for (var i = 0; i < acarreos.length ; i++) {
        console.log(i);
        console.log(acarreos[i]);
        importe = acarreos[i].total_concepto;
        if (categoria === "flete"){
           concepto_id = acarreos[i].concepto_flete;
           zona_id = acarreos[i].zona_id;
          precio_unitario = acarreos[i].precio_flete;
        } else if (categoria === "material"){
          concepto_id = acarreos[i].concepto;
          precio_unitario = acarreos[i].precio;
          zona_id = acarreos[i].zona_id;
        }
        esta_estimacion = acarreos[i].total_cantidad;

        rp.post(path+'api/estimaciones/articulos',{form: {importe: importe, concepto_id: concepto_id, esta_estimacion: esta_estimacion, precio_unitario: precio_unitario, estimacion_id:estimacion_id, zona_id: zona_id }}).then(function (response) {
                var articulo_id = response;
                return rp.get(path+'api/presupuestos/buscar/'+articulo_id)
          }).then(function(response){
            console.log(response)
          })
        }
          return rp.get(path+'api/estimaciones/sumar/'+estimacion_id)
          }).then(function(response){
            res.json({estimacion_id:estimacion_id})
          })
})



router.post('/articulos', function(req,res,err){
  console.log('articulos')
  var concepto_id = req.body.concepto_id;
  var esta_estimacion = req.body.esta_estimacion;
  var precio_unitario = req.body.precio_unitario;
  var importe = req.body.importe;
  var estimacion_id = req.body.estimacion_id;
  var zona_id = req.body.zona_id;
  var nuevoArticuloEstimacion = 'INSERT INTO estimacion_articulo(concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id) VALUE(?,?,?,?,?,?);';
  db.query(nuevoArticuloEstimacion,[concepto_id,esta_estimacion,precio_unitario,importe,estimacion_id,zona_id], function(err,articulo){
    if (err) throw err;
    else {
        console.log(nuevoArticuloEstimacion)
       articulo_id = articulo.insertId;
       console.log(articulo_id)
      res.json(articulo_id)
    }
  })
})


router.get('/sumar/:id', function(req,res,err){
  console.log('sumar')
  var estimacion_id = req.params.id;
  var sumarConceptos = 'SELECT estimaciones.categoria sum(importe) AS subtotal FROM estimacion_articulo WHERE estimacion_id = ? GROUP BY estimacion_articulo.concepto_id';
  var updateTotals = 'UPDATE estimaciones SET subtotal = ?, iva = ?, retencion = ?, total = ? WHERE estimaciones_id = ?';
        db.query(sumarConceptos,[estimacion_id],function(err,totales){
          if(err) throw err;
          else {
              subtotal = Number(totales[0].subtotal);
              if (totales[0].categoria === "flete"){
                retencion = subtotal * .4;
              } else if (totales[0].categoria === "material"){
                retencion = 0;
              }
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
