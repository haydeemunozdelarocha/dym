var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');
var db = require('../db.js');
var passport = require('passport');

var readTable = 'SELECT * FROM obras';
var listaAcarreos = 'SELECT acarreos.*, camiones.capacidad, proveedores.razon_social, materiales.nombre, materiales.precio FROM acarreos JOIN camiones ON camiones.id = acarreos.camion_id JOIN proveedores ON proveedores.id = camiones.proveedor_id JOIN materiales ON materiales.id = acarreos.material_id';
var infoCaptura = 'SELECT * FROM proveedores';
var sess;

router.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'DYM Ingenieros Constructores' });
});

router.get('/auth/nest', passport.authenticate('nest'), function(req, res){
  console.log('sending request')
});

router.get('/auth/nest/callback', passport.authenticate('nest'),
  function(req, res) {
    console.log("callback")
    res.cookie('nest_token', req.user.accessToken,{ maxAge: 900000 });
    console.log(req.user)
    console.log(req.user.accessToken)
    res.redirect('/captura');
//
});

 function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
      next();
    }else{
      res.redirect('/');
    }
  };

router.get('/logout', function(req, res, next) {
req.logout();
res.redirect('/');
});

router.get('/residentes', function(req, res, next) {
  var readTable = 'SELECT * FROM residentes';
    con.query(readTable, function(err, residentes){
    if(err) throw err;
    else {
      res.render('residentes', { title: 'Residentes', residentes: residentes });
    }
  });
});

router.get('/obras', function(req, res, next) {
  var listaObras = 'SELECT obras.*, residentes.nombre FROM obras JOIN residentes ON residentes.id = obras.residente_id';
    db.query(listaObras, function(err, obras){
    if(err) throw err;
    else {
      console.log(obras)
      res.render('obras', { title: 'Obras', obras: obras });
    }
  });
});

router.get('/obras/nueva', function(err,res){
  var infoObras = 'SELECT * FROM residentes';
    db.query(infoObras, function(err, info){
    if(err) throw err;
    else {
        res.render('obranueva', { title: 'Obras', info: info });
    }
  });
})

router.get('/obras/editar/:idobra', function(req,res,err){
    console.log(req.params.idobra)
  var id =req.params.idobra;
  var getObra = "SELECT * FROM `obras` WHERE `id` = "+ id;
    db.query(getObra, function(err, obra){
    if(err) throw err;
    else {
        res.render('editarobra', { title: 'Obras', obra: obra });
    }
  });
})

router.post('/obras/editar/:idobra', function(req,res,err){
request({
  method: "PUT",
  uri: site+"api/obras/"+req.params.idobra,
  json: req.body
 });
})


router.get('/acarreos', function(err,res){
    db.query(listaAcarreos, function(err, acarreos){
    if(err) throw err;
    else {
        res.render('acarreos', { title: 'Acarreos', acarreos: acarreos });
    }
  });
})

router.get('/captura', function(err,res){
    db.query(infoCaptura, function(err, info){
    if(err) throw err;
    else {
        res.render('captura', { title: 'Acarreos', info: info });
    }
  });
})

router.get('/recibo/:id', function(req, res, next) {
  var id = req.params.id;
  var readTable = 'SELECT acarreos.*, camiones.modelo,camiones.placas,camiones.capacidad, camiones.proveedor_id, proveedores.razon_social, materiales.nombre, materiales.precio, materiales.unidad FROM acarreos JOIN camiones ON camiones.id = acarreos.camion_id JOIN proveedores ON proveedores.id = camiones.proveedor_id JOIN materiales ON materiales.id = acarreos.material_id WHERE acarreos.id = ?';
    db.query(readTable,[id], function(err, acarreo){
    if(err) throw err;
    else {
      res.render('recibo', { title: 'Recibo', acarreo: acarreo });
    }
  });
});

router.get('/proveedores', function(req, res, next) {
  var readTable = 'SELECT * FROM proveedores';
    db.query(readTable, function(err, proveedores){
    if(err) throw err;
    else {
      res.render('proveedores', { title: 'Proveedores', proveedores: proveedores });
    }
  });
});

router.get('/proveedores/nuevo', function(err,res){
  var infoProveedores = 'SELECT * FROM proveedores';
    db.query(infoProveedores, function(err, info){
    if(err) throw err;
    else {
        res.render('proveedornuevo', { title: 'Obras', info: info });
    }
  });
})

router.get('/proveedores/editar/:id', function(req,res,err){
  var id =req.params.id;
  var getProveedor = "SELECT * FROM `proveedores` WHERE `id` = "+ id;
    db.query(getProveedor, function(err, proveedor){
    if(err) throw err;
    else {
        res.render('editarproveedor', { title: 'Editar Proveedor', proveedor: proveedor });
    }
  });
})

router.get('/materiales', function(req, res, next) {
  var readTable = 'SELECT materiales.*, proveedores.razon_social FROM materiales JOIN proveedores ON proveedores.id = materiales.proveedor_id';
    db.query(readTable, function(err, info){
    if(err) throw err;
    else {
      res.render('materiales', { title: 'Materiales', info: info });
    }
  });
});

router.get('/materiales/nuevo', function(req, res, next) {
  var readTable = 'SELECT * FROM proveedores';
    db.query(readTable, function(err, proveedores){
    if(err) throw err;
    else {
      res.render('nuevomaterial', { title: 'Proveedores', proveedores: proveedores });
    }
  });
});

router.get('/materiales/editar/:id', function(req, res, next) {
  var id = req.params.id;
  var getMaterial = "SELECT * FROM `materiales` WHERE `id` = " + id;
    db.query(getMaterial, function(err, material){
    if(err) throw err;
    else {
      res.render('editarmaterial', { title: 'Editar Material', material: material });
    }
  });
});


router.get('/estimaciones', function(req, res, next) {
  var readTable = 'SELECT * FROM estimaciones';
    db.query(readTable, function(err, estimaciones){
    if(err) throw err;
    else {
      res.render('estimaciones', { title: 'Estimaciones', estimaciones: estimaciones });
    }
  });
});

router.get('/estimaciones/nueva', function(req, res, next) {
    var readObras = 'SELECT * FROM obras ORDER BY codigo ASC';
    db.query(readObras, function(err, obras){
    if(err) throw err;
    else {
          var readProveedores = 'SELECT * FROM proveedores ORDER BY razon_social ASC';
          db.query(readProveedores, function(err, proveedores){
          if(err) throw err;
          else {
          var getLastEstimacion = 'SELECT * FROM estimaciones ORDER BY id DESC LIMIT 1';
              db.query(getLastEstimacion, function(err, ultimaEstimacion){
              if(err) throw err;
              else {
                res.render('nuevaestimacion', { title: 'Estimaciones', obras: obras, proveedores: proveedores, ultimaEstimacion: ultimaEstimacion });
          }
        });
          }
        });
  }
  });
});

router.get('/estimaciones/editar/:id', function(req, res, next) {
  var id = req.params.id;
  var getEstimacion = "SELECT * FROM `estimacion` WHERE `id` = " + id;
    db.query(getEstimacion, function(err, estimacion){
    if(err) throw err;
    else {
      res.render('editarestimacion', { title: 'Editar Estimación', estimacion: estimacion });
    }
  });
});

router.get('/empleados', function(req, res, next) {
  var readTable = 'SELECT * FROM empleados';
    db.query(readTable, function(err, empleados){
    if(err) throw err;
    else {
      res.render('empleados', { title: 'Empleados', empleados: empleados });
    }
  });
});

router.get('/camiones', function(req, res, next) {
  var readTable = 'SELECT camiones.*, proveedores.razon_social FROM camiones JOIN proveedores ON proveedores.id = camiones.proveedor_id';
    db.query(readTable, function(err, camiones){
    if(err) throw err;
    else {
      res.render('camiones', { title: 'Camiones', camiones: camiones });
    }
  });
});

router.get('/camiones/editar/:id', function(req, res, next) {
  var id = req.params.id;
  var getCamion = "SELECT * FROM `camiones` WHERE `id` = " + id;
    db.query(getCamion, function(err, camion){
    if(err) throw err;
    else {
      res.render('editarcamion', { title: 'Editar Camión', camion: camion });
    }
  });
});

router.get('/camiones/nuevo', function(req, res, next) {
    var getProveedores = "SELECT * FROM `proveedores`";
    db.query(getProveedores, function(err, proveedores){
    if(err) throw err;
    else {
      res.render('nuevocamion', { title: 'Nuevo Camión', proveedores: proveedores });
    }
  });
});

module.exports = router;



