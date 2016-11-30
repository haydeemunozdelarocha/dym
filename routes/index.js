var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var request = require('request');
var db = require('../db.js');
var passport = require('passport');

var readTable = 'SELECT * FROM obras';
var listaAcarreos = 'SELECT acarreos.*, camiones.*, proveedores.razon_social, materiales.nombre, materiales.precio FROM acarreos JOIN camiones ON camiones.camion_id = acarreos.flete JOIN proveedores ON proveedores.id = camiones.proveedor_id JOIN materiales ON materiales.id = acarreos.material';

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
  res.render('login', { title: 'Express' });
});

router.post('/signin', function(req,res,next){
  var username = req.body.username;
  var password = req.body.password;
  console.log(req.body)
      db.query("SELECT * FROM `users` WHERE `username` = '" + username + "'",function(err,rows){
      if (err)
                return err;
       if (!rows.length) {
                 res.send('No user found.');
            }

      // if the user is found but the password is wrong
            if (!( rows[0].password == password))
                res.send('Wrong password.');// create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return  req.logIn(rows[0], function (err) {
                    if (err) {
                        return err;
                    }
                        return res.redirect('/captura');
                });

    });
});

router.get('/register/:accessToken', function(req, res, next) {
  var accessToken = req.params.accessToken;
  var readObras = 'SELECT * FROM obras';
    db.query(readObras, function(err, obras){
      console.log(obras)
    if(err) throw err;
    else {
      res.render('register', { title: 'Register', obras: obras, accessToken:accessToken });
    }
  });
});

router.post('/signup/:accessToken', function(req, res, next){
  var accessToken = req.params.accessToken;
  var username = req.body.username;
   var password = req.body.password;
   var empleado_id= req.body.empleado_id;
     var obra_id= req.body.obra_id;
      db.query("select * from users where username = '"+username+"'",function(err,rows){
      console.log(rows);
      console.log("above row object");
      if (err)
                return err;
       if (rows.length) {
                res.redirect('/register');
            } else {
                var newUserMysql = new Object();

        newUserMysql.accessToken    = accessToken;
        newUserMysql.username    = username;
        newUserMysql.password    = password;
        newUserMysql.empleado_id    = empleado_id;
        newUserMysql.obra_id    = obra_id;

        var insertQuery = "INSERT INTO users ( accessToken, username, password, empleado_id ) values ('" + accessToken+"','"+username+"','"+password+"','"+empleado_id+"')";
        db.query(insertQuery,function(err,rows){
          newUserMysql.usersid = rows.insertId;
             req.logIn(newUserMysql, function (err) {
                    if (err) {
                        return err;
                    }
                        console.log(req.user)
                        return res.redirect('/captura');
                });
        });
      }
    });
});


router.get('/auth/nest', passport.authenticate('nest'), function(req, res){
  console.log('sending request')
});

router.get('/auth/nest/callback', passport.authenticate('nest'),
  function(req, res) {
    console.log("callback")
    res.cookie('nest_token', req.user.accessToken,{ maxAge: 900000 });
    var accessToken = req.user.accessToken;
        console.log(accessToken)
        res.redirect('/register/'+accessToken)
  });


 function isLoggedIn(req, res, next){
  console.log('is logged in?')
    if (req.isAuthenticated()) {
      console.log(req.user)
      next();
    }else{
      res.redirect('/login');
    }
  };

router.get('/logout', function(req, res, next) {
req.logout();
res.redirect('/');
});

router.get('/buscar', function(req, res, next) {
  var readTable = 'SELECT * FROM proveedores';
  var readObras = 'SELECT * FROM obras';
    db.query(readTable, function(err, proveedores){
    if(err) throw err;
    else {
          db.query(readObras, function(err, obras){
            if(err) throw err;
            else {
              res.render('buscar', { title: 'Buscar', proveedores: proveedores, obras: obras });
            }
          });
    }
  });
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
  var getObra = "SELECT * FROM `obras` WHERE `obra_id` = "+ id;
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

router.get('/presupuestos', function(err,res){
  var infoObras = 'SELECT * FROM obras';
    db.query(infoObras, function(err, obras){
    if(err) throw err;
    else {
          var infoConceptos = 'SELECT * FROM conceptos';
          db.query(infoConceptos, function(err, conceptos){
          if(err) throw err;
          else {
              var infoZonas = 'SELECT * FROM zonas';
              db.query(infoZonas, function(err, zonas){
              if(err) throw err;
              else {
                var getPresupuestos = 'SELECT presupuestos.*, conceptos.*, zonas.*, obras.* FROM presupuestos JOIN obras ON presupuestos.obra=obras.obra_id JOIN zonas ON presupuestos.zona = zonas.zonas_id JOIN conceptos ON presupuestos.concepto = conceptos.conceptos_id';
                db.query(getPresupuestos, function(err, presupuestos){
                if(err) throw err;
                else {
                res.render('presupuestonuevo', { title: 'Presupuesto', obras: obras, conceptos: conceptos, zonas: zonas, presupuestos: presupuestos });
                    }
                });
            }
        });
        }
      });
    }
  });
})


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
  var getObra = "SELECT * FROM `obras` WHERE `obra_id` = "+ id;
    db.query(getObra, function(err, obra){
    if(err) throw err;
    else {
        res.render('editarobra', { title: 'Obras', obra: obra });
    }
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

router.get('/captura', isLoggedIn, function(req, res){
  var infoProveedores = 'SELECT * FROM proveedores';
  var infoZonas = 'SELECT * FROM zonas';
    db.query(infoProveedores, function(err, proveedores){
    if(err) throw err;
    else {
        db.query(infoZonas, function(err, zonas){
          if(err) throw err;
          else {
        res.render('captura', { title: 'Acarreos', proveedores: proveedores, zonas:zonas });
          }
        });
    }
  });
})

router.get('/recibo/:id', function(req, res, next) {
  var id = req.params.id;
  var readTable = 'SELECT acarreos.*, recibos.* FROM acarreos JOIN recibos ON acarreos.recibo_id = recibos.recibo_id WHERE acarreos.recibo_id = ?';
  var readMaterial = 'SELECT materiales.*, proveedores.razon_social, conceptos.* FROM materiales JOIN proveedores ON materiales.proveedor_id = proveedores.id JOIN conceptos ON materiales.concepto = conceptos.conceptos_id WHERE materiales.id = ?';
    var readCamion = 'SELECT camiones.*,proveedores.razon_social FROM camiones JOIN proveedores ON camiones.proveedor_id = proveedores.id WHERE camion_id = ?';
    db.query(readTable,[id], function(err, acarreo){
    if(err) throw err;
    else {
      var material_id = acarreo[1].material_id;
      var camion_id = acarreo[0].camion_id;
      db.query(readMaterial,[material_id], function(err, material){
        if(err) throw err;
        else {
          db.query(readCamion,[camion_id], function(err, camion){
            if(err) throw err;
            else {
              res.render('recibo', { title: 'Recibo', acarreo: acarreo, material:material, camion:camion});
            }
          });
        }
      });
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
  var readTable = 'SELECT materiales.*, conceptos.nombre_concepto, proveedores.razon_social FROM materiales JOIN proveedores ON proveedores.id = materiales.proveedor_id JOIN conceptos ON conceptos.conceptos_id = materiales.concepto';
    db.query(readTable, function(err, info){
    if(err) throw err;
    else {
        var readConceptos = 'SELECT * FROM conceptos'
        db.query(readConceptos, function(err, conceptos){
        if(err) throw err;
        else {
          res.render('materiales', { title: 'Materiales', info: info, conceptos:conceptos });
        }
      });
    }
  });
});

router.get('/materiales/nuevo', function(req, res, next) {
  var readTable = 'SELECT * FROM proveedores';
    db.query(readTable, function(err, proveedores){
    if(err) throw err;
    else {
      var readConceptos = 'SELECT * FROM conceptos'
        db.query(readConceptos, function(err, conceptos){
          if(err) throw err;
          else {
            res.render('nuevomaterial', { title: 'Proveedores', proveedores: proveedores, conceptos: conceptos });
          }
        });
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

router.get('/estimaciones/:id', function(req,res,err){
  var estimacion_id = req.params.id;
  console.log(estimacion_id)
  var getEstimacion = 'SELECT estimaciones.*,obras.nombre_obra,proveedores.razon_social FROM estimaciones JOIN obras ON estimaciones.obra = obras.obra_id JOIN proveedores ON proveedores.id = estimaciones.proveedor WHERE estimaciones_id = ?';
  var getEstimacionArticulos = 'SELECT estimacion_articulo.*,conceptos.nombre_concepto FROM estimacion_articulo JOIN conceptos ON estimacion_articulo.concepto_id = conceptos.conceptos_id WHERE estimacion_id = ?';
    db.query(getEstimacion,[estimacion_id], function(err, estimacion){
    if(err) throw err;
    else {
            console.log(getEstimacion)
      console.log(estimacion)
      db.query(getEstimacionArticulos,[estimacion_id], function(err, articulos){
            if(err) throw err;
            else {
              console.log(getEstimacionArticulos)
              console.log(articulos)
                res.render('estimacion',{estimacion:estimacion, articulos:articulos});
            }
          });
    }
  });
})
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



