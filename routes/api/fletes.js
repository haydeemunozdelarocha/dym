var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var moment= require('moment');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

router.post('/', function(req,res,err){
  console.log(req.body)
  var obra_id = req.body.obra_id;
  var proveedor_id = req.body.proveedor_id;
  var precio = Number(req.body.precio);
  console.log(precio)
  var banco = req.body.banco;
  var unidad = req.body.unidad;
  var postFlete = 'INSERT INTO fletes(obra_id,proveedor_id,precio,unidad,banco) VALUE(?,?,?,?,?)';
    db.query(postFlete,[obra_id,proveedor_id,precio,unidad,banco], function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.get('/', function(req,res,err){
  console.log(req.body)

  var getFletes = 'SELECT acarreos_flete.concepto_flete,fletes.fletes_id, recibos.zona_id,fletes.precio,fletes.unidad,presupuestos.presupuestos_id,presupuestos.costo,presupuestos.total AS presupuestado,presupuestos.acumulado, sum(acarreos_flete.total_flete) AS total_concepto, sum(acarreos_flete.cantidad) AS total_cantidad FROM acarreos_flete JOIN recibos ON acarreos_flete.recibo_id = recibos.recibo_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id LEFT JOIN proveedores ON fletes.proveedor_id = proveedores.id LEFT JOIN presupuestos ON presupuestos.concepto = acarreos_flete.concepto_flete AND presupuestos.zona = recibos.zona_id AND presupuestos.obra = recibos.obra_id WHERE acarreo_id IN (2232,2242,2252,2262,2272,2282,2292,2302,2312,2322,2332,2342,2352,2362,2372,2382,2392,2402,2412,2422,2432,2442,2462,2472,2482,2492,2502,2512,2522,2532,2542,2552,2562,2582,2592,2602,2612,2622,2632,2642,2652,2662,2672,2682,2692,2702,2712,2722,2732,2742,2752,2762,2772,2782,2792,2802,2812,2822,2832,2842,2852,2862,2872,2882,2892,2902,2912,2922,2932,2942,2952,2962,2972,2982,2992,3002,3012,3022,3032,3042,3052,3062,3072,3082,3092,3102,3112,3122,3132,3142,3152,3162,3172,3182,3192,3202,3212,3222,3232,3242,3252,3262,3272,3282,3292,3302,3312,3322,3332,3342,3352,3362,3372,3382,3392,3402,3412,3422,3432,3442,3452,3462,3472,3482,3492,3502,3512,3522,3532,3542,3552,3562,3572,3582,3592,3602,3612,3622,3632,3642,3652,3662,3672,3682,3692,3702,3712,3722,3732,3742,3752,3762,3772,3782,3792,3802,3812,3822,3832,3842,3852,3862,3872,3882,3892,3902,3912,3922,3932,3942,3952,3962,3972,3982,3992,4002,4012,4022,4032,4042,4052,4062,4072,4082) GROUP BY concepto_flete,flete_id, zona_id;';
    db.query(getFletes, function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.post('/precio', function(req,res,err){
  var obra_id = req.user.obra_id;
  var proveedor_id = req.body.proveedor_id;
  var banco_id = req.body.banco_id;

    var getPrecio = 'SELECT * FROM fletes WHERE proveedor_id = ? AND obra_id = ? AND banco = ?';
    db.query(getPrecio,[proveedor_id,obra_id,banco_id],function(err, rows){
    if(err) throw err;
    else {
        res.json(rows);
    }
  });
})

router.get('/:proveedorid/:obraid', function(req,res,err){
  console.log('getting')
  var id = Number(req.params.proveedorid);
  var obra_id = req.params.obraid;
  var listaFletesProveedor = 'SELECT a.*, bp.razon_social AS nombre_banco, a.proveedor_id, bc.razon_social AS nombre_proveedor FROM fletes AS a LEFT JOIN proveedores AS bp ON bp.id = a.banco LEFT JOIN proveedores AS bc ON bc.id = a.proveedor_id WHERE a.proveedor_id = ? AND a.obra_id = ?';

    db.query(listaFletesProveedor,[id, obra_id], function(err, rows){
      console.log(listaFletesProveedor)
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/material', function(err,res){
  var getPrecio = 'SELECT recibos.recibo_id,recibos.hora,recibos.foto, acarreos.estimacion,acarreos.acarreo_id,acarreos.categoria,proveedores.razon_social, conceptos.nombre_concepto,zonas.nombre_zona FROM acarreos JOIN recibos ON recibos.recibo_id = acarreos.recibo_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN proveedores ON camiones.proveedor_id = proveedores.id OR materiales.proveedor_id = proveedores.id LEFT JOIN conceptos ON acarreos.concepto_flete=conceptos.conceptos_id OR materiales.concepto = conceptos.conceptos_id ORDER BY acarreos.acarreo_id ASC';
    db.query(listaAcarreos, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
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

  //Update a record.
router.put('/:idfletes', function(req,res,err){
  var id=req.params.idfletes;
  id= Number(id);
  var precio1 = req.body.precio1;
  var precio2 = req.body.precio2;
  var editarFletes = 'UPDATE `fletes` SET `precio1` = ?, `precio2` = ? WHERE `fletes_id`= ?';
    db.query(editarFletes,[precio1,precio2,id], function(err, flete){
        console.log(editarFlete);
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/fletes');
    }
  });
})

router.delete('/borrar/:id', function(req,res,err){
  var flete_id = req.params.id;
  console.log(flete_id)
  var borrarFletes = 'DELETE FROM fletes WHERE fletes_id = ?';
  db.query(borrarFletes,[flete_id], function(err,flete){
    if(err) throw err;
    else {
        console.log('Flete eliminado');
        res.send(flete)
    }
  });
})

module.exports = router;
