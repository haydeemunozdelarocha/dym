var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var db = require('../../db.js');

var nuevoMaterial = 'INSERT INTO materiales_n(obra_id,concepto_id,flete_unidad,precio_carga_obra,prov_carga_obra,flete_precio,flete_prov,dep_tiradero_precio,dep_tiradero_prov,derecho_banco_prov,derecho_banco_unidad,derecho_banco_precio,precio_carga_banco,prov_carga_banco) VALUE(?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
var listaMateriales = 'SELECT materiales_n.*, conceptos.* FROM materiales_n JOIN conceptos ON conceptos.conceptos_id = materiales_n.concepto_id';


//agregar material
router.post('/', function(req,res, err){
  console.log(req.body)
  var usuario = req.user;
var obra_id = Number(req.body.obra_id);
var concepto= req.body.concepto;
var flete_unidad= req.body.flete_unidad;
var precio_carga_obra = req.body.precio_carga_obra;
var prov_carga_obra = req.body.prov_carga_obra;
var flete_precio = req.body.flete_precio;
var flete_prov=req.body.flete_prov;
var flete_unidad=req.body.flete_unidad;
var dep_tiradero_precio = req.body.dep_tiradero_precio;
var dep_tiradero_prov = req.body.dep_tiradero_prov;
var derecho_banco_prov= req.body.derecho_banco_prov;
var derecho_banco_precio = req.body.derecho_banco_precio;
var derecho_banco_unidad= req.body.derecho_banco_unidad;
var precio_carga_banco = req.body.precio_carga_banco;
var prov_carga_banco = req.body.prov_carga_banco;

db.query(nuevoMaterial,[obra_id,concepto,flete_unidad,precio_carga_obra,prov_carga_obra,flete_precio,flete_prov,dep_tiradero_precio,dep_tiradero_prov,derecho_banco_prov,derecho_banco_unidad,derecho_banco_precio,precio_carga_banco,prov_carga_banco], function(err,material){
      if(err) throw err;
      else {
          res.redirect('/materiales');
      }
    });
})

//Read table.
router.get('/', function(err,res){
    db.query(listaMateriales, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/banco/:banco/:concepto', function(req,res,err){
  var banco_id = req.params.banco;
  var obra_id = req.user.obra_id;
  var concepto_id = req.params.concepto;
  var listaMateriales = 'SELECT materiales.id,materiales.precio FROM materiales WHERE proveedor_id ='+banco_id+' AND obra_id ='+obra_id+' AND concepto='+concepto_id+';';
  console.log(listaMateriales);
    db.query(listaMateriales, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/v2/:banco/:fletero/:concepto', function(req,res,err){
  var banco_id = req.params.banco;
  var banco_query = ''
  if(banco_id != 0){
    banco_query = ' AND derecho_banco_prov ='+banco_id;
  }
  var fletero = req.params.fletero;
  var obra_id = req.user.obra_id;
  var concepto_id = req.params.concepto;
  var listaMateriales = 'SELECT materiales_n.material_id FROM materiales_n WHERE flete_prov = '+fletero+' AND concepto_id = '+concepto_id+' AND obra_id ='+obra_id+' '+banco_query+';';
  console.log(listaMateriales);
    db.query(listaMateriales, function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/acarreoint/:proveedorid', function(req,res,err){
  var id = Number(req.params.proveedorid);
  if(req.user.categoria === "checador"){
      var obra_id = req.user.obra_id;
    } else {
    var obra_id = req.query.obra_id;
    }
  var listaMaterialesProveedor = 'SELECT * FROM fletes WHERE fletes.proveedor_id = ? AND fletes.obra_id = ? AND banco = 0';
    db.query(listaMaterialesProveedor,[id,obra_id], function(err, rows){
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/acarreoext/:proveedorid', function(req,res,err){
  var id = Number(req.params.proveedorid);
  if(req.user.categoria === "checador"){
      var obra_id = req.user.obra_id;
    } else {
    var obra_id = req.query.obra_id;
    }
  console.log(obra_id)
  var listaMaterialesProveedor = 'SELECT materiales.*, conceptos.nombre_concepto FROM materiales INNER JOIN conceptos ON materiales.concepto = conceptos.conceptos_id WHERE materiales.proveedor_id = ? AND materiales.obra_id = ? AND conceptos_id = 92';
  console.log(listaMaterialesProveedor)
    db.query(listaMaterialesProveedor,[id,obra_id], function(err, rows){
    if(err) {console.log(err)}
    else {
        res.send(rows);
    }
  });
})

router.get('/acarreomat/:proveedorid', function(req,res,err){
  var id = Number(req.params.proveedorid);

  var obra_id;
  if(req.user.categoria === "checador"){
      obra_id = req.user.obra_id;
    } else {
    obra_id = req.query.obra_id;
    }
    console.log(obra_id)
  var listaMaterialesProveedor = 'SELECT materiales.*, conceptos.nombre_concepto FROM materiales INNER JOIN conceptos ON materiales.concepto = conceptos.conceptos_id WHERE materiales.proveedor_id = ? AND materiales.obra_id = ? AND conceptos_id != 92 AND conceptos_id != 82';
    db.query(listaMaterialesProveedor,[id,obra_id], function(err, rows){
    if(err) throw err;
    else {
      console.log(listaMaterialesProveedor);
      console.log(rows)
        res.send(rows);
    }
  });
})


// router.get('/:proveedorid/:categoria', function(req,res,err){
//   var id = Number(req.params.proveedorid);
//   var categoria = req.params.categoria;
//   var obra_id = req.user.obra_id;
//   var listaMaterialesProveedor = 'SELECT materiales.*, conceptos.nombre_concepto FROM materiales INNER JOIN conceptos ON materiales.concepto = conceptos.conceptos_id WHERE materiales.proveedor_id = ? AND materiales.obra_id = ? AND materiales.categoria = ?';
//   console.log(categoria)
//     db.query(listaMaterialesProveedor,[id,obra_id,categoria], function(err, rows){
//     if(err) throw err;
//     else {
//         res.send(rows);
//     }
//   });
// })

router.get('/:proveedorid/:obraid', function(req,res,err){
  var id = Number(req.params.proveedorid);
  var obra_id = req.params.obraid;
  var listaMaterialesProveedor = 'SELECT materiales.id,materiales.unidad,materiales.precio,proveedores.razon_social,conceptos.nombre_concepto FROM materiales JOIN conceptos ON materiales.concepto = conceptos.conceptos_id JOIN proveedores ON materiales.proveedor_id = proveedores.id WHERE materiales.proveedor_id = ? AND materiales.obra_id = ?';

    db.query(listaMaterialesProveedor,[id, obra_id], function(err, rows){
      console.log(listaMaterialesProveedor)
    if(err) throw err;
    else {
        res.send(rows);
    }
  });
})

router.get('/:id', function(req, res, err){
  console.log('getting material back end')
  var id= Number(req.params.id);
  console.log(id)
  var getMaterial = 'SELECT * FROM `materiales` WHERE `id` = ?';

  db.query(getMaterial,[id],function(err, material){
    if(err) throw err;
    else {
        console.log(material[0]);
        res.send(material[0])
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
router.put('/:idmaterial', function(req,res,err){
  var id=req.params.idmaterial;
  id= Number(id);
  var precio = req.body.precio;
  var editarMaterial = 'UPDATE `materiales` SET `precio` = ? WHERE `id`= ?';
    db.query(editarMaterial,[precio,id], function(err, material){
        console.log(editarMaterial);
    if(err) throw err;
    else {
        console.log('Listo');
        res.redirect('/materiales');
    }
  });
})

router.delete('/borrar/:id', function(req,res,err){
  var material_id = req.params.id;
  console.log(material_id)
  var borrarMaterial = 'DELETE FROM materiales WHERE id = ?';
  db.query(borrarMaterial,[material_id], function(err,material){
    if(err) throw err;
    else {
        console.log('Esta estimación ha sido eliminada');
        res.send(material)
    }
  });
})

module.exports = router;
