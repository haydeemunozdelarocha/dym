var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db.js');
var passport = require('passport');
var rp = require('request-promise');
var moment= require('moment');
var fs = require('fs');
var PdfPrinter = require('pdfmake/src/printer');


var path = 'http://localhost:3000/';
   var fonts = {
        Roboto: {
            normal: './fonts/Keyboard.ttf',
            bold: './fonts/Keyboard.ttf',
            italics: './fonts/Keyboard.ttf',
            bolditalics: './fonts/Keyboard.ttf'
        }
    };

    var printer = new PdfPrinter(fonts);

//Middleware

router.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
      console.log(req.user)
      next();
    } else{
      res.redirect('/login');
    }
};

function checkAuthToken(req, res, next) {
    if(!req.user.accessToken) {
      res.cookie('user', req.user,{ maxAge: 900000 });
      return res.redirect('/users/auth/nest')
    } else {
      next()
    }
}

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

/* MAIN VIEWS */
router.get('/',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  res.render('index', { title: 'DYM INGENIEROS CONSTRUCTORES', usuario:usuario });
});

router.get('/administrador', isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var getObras = 'SELECT * FROM obras ORDER BY obra_id ASC;';
  var getEmpleados = 'SELECT * FROM empleados WHERE obra = ?;';
  var getPresupuesto = 'SELECT presupuestos.*,conceptos.nombre_concepto,zonas.nombre_zona FROM presupuestos JOIN conceptos ON presupuestos.concepto = conceptos.conceptos_id JOIN zonas ON presupuestos.zona = zonas.zonas_id WHERE obra = ? ORDER BY zona;';
    db.query(getObras, function(err, obras){
    if(err) throw err;
    else {
      var obra_id = obras[0].obra_id;
        db.query(getPresupuesto,[obra_id], function(err, presupuestos){
        if(err) throw err;
        else {
              db.query(getEmpleados,[obra_id], function(err, empleados){
              if(err) throw err;
              else {
                res.render('costosdashboard', { title: obras[0].nombre_obra, obra: obras[0], obras:obras, presupuestos:presupuestos,empleados:empleados, usuario:usuario });
              }
            });
        }
      });
    }
  });
});

//LOGIN & LOGOUT
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'DYM INGENIEROS CONSTRUCTORES' });
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/login');
});

//CAPTURA DE ACARREOS
router.get('/captura', [isLoggedIn,checkAuthToken], function(req, res){
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
  var readTable = 'SELECT acarreos.recibo_id,acarreos.cantidad, recibos.hora,recibos.zona_id, camiones.camion_id,camiones.placas, camiones.modelo, materiales.unidad,proveedores.razon_social, conceptos.nombre_concepto FROM acarreos JOIN recibos ON acarreos.recibo_id = recibos.recibo_id LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN materiales ON acarreos.material_id = materiales.id LEFT JOIN proveedores ON proveedores.id = camiones.proveedor_id OR proveedores.id = materiales.proveedor_id LEFT JOIN conceptos ON conceptos.conceptos_id = materiales.concepto OR conceptos.conceptos_id = acarreos.concepto_flete WHERE acarreos.recibo_id = ?;';
          db.query(readTable,[id], function(err, acarreos){
            if(err) throw err;
            else {
              res.render('recibo', {acarreos:acarreos})
            }
          });

});


// //recibo returning Encoded HTML
// router.get('/recibo/:id', function(req, res, next) {
//   var id = req.params.id;
//   var readTable = 'SELECT acarreos.*, recibos.* FROM acarreos JOIN recibos ON acarreos.recibo_id = recibos.recibo_id WHERE acarreos.recibo_id = ?';
//   var readMaterial = 'SELECT materiales.*, proveedores.razon_social, conceptos.* FROM materiales JOIN proveedores ON materiales.proveedor_id = proveedores.id JOIN conceptos ON materiales.concepto = conceptos.conceptos_id WHERE materiales.id = ?';
//     var readCamion = 'SELECT camiones.*,proveedores.razon_social FROM camiones JOIN proveedores ON camiones.proveedor_id = proveedores.id WHERE camion_id = ?';
//     db.query(readTable,[id], function(err, acarreo){
//     if(err) throw err;
//     else {
//       var material_id = acarreo[1].material_id;
//       var camion_id = acarreo[0].camion_id;
//       db.query(readMaterial,[material_id], function(err, material){
//         if(err) throw err;
//         else {
//           db.query(readCamion,[camion_id], function(err, camion){
//             if(err) throw err;
//             else {
//               var image = base64_encode('./public/images/dym-logo copy.bmp');
//               console.log(acarreo[0].hora)
//               var html = '<img height="100px" src="data:image/bmp;base64,'+image+'"/><h2>DYM INGENIEROS CONSTRUCTORES SA DE CV</h2><h2>RECIBO ACARREOS</h2><div id="recibo-style" style="font-size: 20px;"><h3><strong>Fecha: </strong>'+acarreo[0].hora+'</h3><h3><strong>Recibo No.:</strong>'+acarreo[0].recibo_id+'</h3><h3><strong>No. Camión:</strong>'+camion[0].camion_id+'</h3><h3><strong>Placas:</strong>'+camion[0].placas+'</h3><h3><strong>Modelo:</strong>'+camion[0].modelo+'</h3><h3><strong>Fletero:</strong>'+camion[0].razon_social+'</h3><br><h3><strong>Material:</strong>'+material[0].nombre_concepto+'</h3><h3><strong>Proveedor:</strong>'+material[0].razon_social+'</h3><h3><strong>Cantidad:</strong>'+acarreo[0].cantidad+' '+material[0].unidad+'</h3><h3><strong>Precio Unitario: </strong>$'+material[0].precio+'</h3>';
//               html = encodeURIComponent(html);
//               console.log(html)
//               res.send(html);
//             }
//           });
//         }
//       });
//     }
//   });
// });

//ESTIMACIONES
router.get('/buscar',isLoggedIn, function(req, res, next) {
  var usuario=req.user;
  var readTable = 'SELECT * FROM proveedores';
  var readObras = 'SELECT * FROM obras';
    db.query(readTable, function(err, proveedores){
    if(err) throw err;
    else {
          db.query(readObras, function(err, obras){
            if(err) throw err;
            else {
              res.render('buscar', { title: 'Buscar', proveedores: proveedores, obras: obras,usuario:usuario });
            }
          });
    }
  });
});

router.get('/estimaciones',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  console.log('sending request')
  var estimaciones;
    rp(path+'api/estimaciones/').then(function(response,error) {
            console.log(error)
      response = JSON.parse(response)
    if (!error) {
      estimaciones = response
      console.log(estimaciones)
          res.render('estimaciones', { title: 'Estimaciones', estimaciones: estimaciones, usuario: usuario });
    }
  })
});


router.get('/estimaciones/imprimir/:id',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var estimacion_id = req.params.id;
  var residenteURL;
  var contratistaURL;
  var autorizacionURL;
  var getEstimacion = 'SELECT estimaciones.*,obras.nombre_obra,proveedores.razon_social FROM estimaciones JOIN obras ON estimaciones.obra = obras.obra_id JOIN proveedores ON proveedores.id = estimaciones.proveedor_id WHERE estimaciones_id = ?';
  var getEstimacionArticulos = 'SELECT estimacion_articulo.*,conceptos.nombre_concepto,zonas.nombre_zona FROM estimacion_articulo JOIN conceptos ON estimacion_articulo.concepto_id = conceptos.conceptos_id JOIN zonas ON estimacion_articulo.zona_id = zonas.zonas_id WHERE estimacion_id = ?';
    db.query(getEstimacion,[estimacion_id], function(err, estimacion){
    if(err) throw err;
    else {
          var firmaResidente = {
              method: 'GET',
              uri: estimacion[0].firma_residente,
              encoding: null, //  if you expect binary data
              responseType: 'buffer'
          };
          var firmaContratista = {
              method: 'GET',
              uri: estimacion[0].firma_contratista,
              encoding: null, //  if you expect binary data
              responseType: 'buffer'
          };
          if(estimacion[0].autorizacion){
          var autorizacion = {
              method: 'GET',
              uri: estimacion[0].autorizacion || null,
              encoding: null, //  if you expect binary data
              responseType: 'buffer'
          };
        }
          console.log(firmaResidente)
          rp(firmaResidente).then(function (repos) {
            console.log(repos);
            residenteURL = 'data:image/png;base64,'+repos.toString('base64')
            console.log(residenteURL)
            return rp(firmaContratista)
          }).then(function (repos) {
            console.log(repos);
            contratistaURL = 'data:image/png;base64,'+repos.toString('base64')
            console.log(contratistaURL)
            if (autorizacion){
              console.log('si hay autorizacion')
            return rp(autorizacion)
          }
          }).then(function (repos) {
            console.log(repos);
            autorizacionURL = 'data:image/png;base64,'+repos.toString('base64')
            console.log(autorizacionURL)
            if(!repos){
              return
            }
          }).then(()=>{

      console.log(estimacion[0])
      db.query(getEstimacionArticulos,[estimacion_id], function(err, articulos){
            if(err) throw err;
            else {
              var rows = [
          ['Concepto', 'Zona', 'Unidad', 'Cantidad Presupuestada','Acumulado Anterior','Esta Estimacion','Acumulado Actual','Por Ejercer','Precio Unitario','Importe']
        ];
         var totales = [
          ['','', ''],
          ['','subtotal',estimacion[0].subtotal],
          ['','iva',estimacion[0].iva],
          ['','retencion',estimacion[0].retencion],
          ['','total',estimacion[0].total]
        ];

              for(var i = 0; i < articulos.length; i++){
                var row = [articulos[i].nombre_concepto.toString(),articulos[i].nombre_zona.toString(),articulos[i].unidad.toString(),articulos[i].cantidad_presupuestada.toString(),articulos[i].acumulado_anterior.toString(),articulos[i].esta_estimacion.toString(),articulos[i].acumulado_actual.toString(),articulos[i].por_ejercer.toString(),articulos[i].precio_unitario.toString(),articulos[i].importe.toString()];
                rows.push(row);
                if(articulos.length == i+1){
                  console.log('done')

                var docDefinition = {
                  pageOrientation: 'landscape',
                  content: [
                    {text: 'Numero: '+estimacion[0].estimaciones_id, style: 'subheader'},
                    {text: 'Obra: '+estimacion[0].nombre_obra, style: 'subheader'},
                    {
                      style: 'tableExample',
                      table: {
                        body: rows
                      },
                      layout: {
                        fillColor: function (i, node) { return (i % 2 === 0) ?  '#CCCCCC' : null; }
                      }
                    },
                    {
                      style: 'totalesTable',
                      table: {
                        widths: [550, '*', '*'],
                        body: totales
                      },
                       alignment: 'right',
                      layout: 'noBorders'
                    },
                    {style: 'firmasTable',
                      table: {
                        widths: ['*', '*', '*'],
                        body: [
                        {
                      image: residenteURL,
                        width: 200
                    },
                    {
                      text: 'Residente'
                    }]
                      },
                       alignment: 'right',
                      layout: 'noBorders'
                    },
                        {
                      image: residenteURL,
                        width: 200
                    },
                    {
                      text: 'Residente'
                    },
                    {
                      image: contratistaURL,
                        width: 200
                    },
                    {
                      text: 'Contratista'
                    },
                    {
                      image: autorizacionURL,
                        width: 200
                    },
                    {
                      text: 'Ing.Reyes'
                    }
                  ],
                  styles: {
                    header: {
                      fontSize: 18,
                      bold: true,
                      margin: [0, 0, 0, 10]
                    },
                    subheader: {
                      fontSize: 16,
                      bold: true,
                      margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                      margin: [0, 5, 0, 15]
                    },
                    totalesTable: {
                     border: false
                    }
                  }
                };
    var pdfDoc = printer.createPdfKitDocument(docDefinition);
        console.log('creating doc')
    var chunks = []
    var result

    pdfDoc.on('data', function (chunk) {
      chunks.push(chunk)
    });
    pdfDoc.on('end', function () {
      result = Buffer.concat(chunks)

      res.contentType('application/pdf')
      res.send(result)
    });
    pdfDoc.end();
  }
  }
            }
        });
      })
      }
  });
});

router.get('/estimaciones/nueva', function(req, res, next) {
  var obra_id=req.user.obra_id;
  var estimacion_id;
  var obras;
  var proveedores;
  var date = Date.now();
  var fecha = moment(date).format("YYYY-MM-DD HH:mm");
  var periodo_inicio = req.body.date1;
  var periodo_final = req.body.date2;
  var proveedor_id = req.body.proveedor;
    var nuevaEstimacion = 'INSERT INTO estimaciones(obra,fecha,periodo_inicio,periodo_final,proveedor_id) VALUE(?,?,?,?,?)';
    var readObras = 'SELECT * FROM obras ORDER BY codigo ASC';
    var getLastEstimacion = 'SELECT * FROM estimaciones ORDER BY estimaciones_id DESC LIMIT 1';
    var readProveedores = 'SELECT * FROM proveedores ORDER BY razon_social ASC';

     db.query(nuevaEstimacion,[obra_id,fecha,periodo_inicio,periodo_final,proveedor_id])
     .then( function(estimaciones,err){
      if(err) throw err;
        else {
          estimacion_id=estimaciones.insertId;
          return db.query(readObras)
        }
      }).then(function(rows, err){
      if(err) throw err;
        else {
          obras = rows;
          return db.query(readProveedores);
        }
      }).then(function (rows, err){
      proveedores = rows;
     }).then(function() {
         res.render('nuevaestimacion', { title: 'Estimaciones', obras: obras, proveedores: proveedores, estimacion_id:estimacion_id, obra_id:obra_id });
     })
});



router.get('/estimaciones/:id', isLoggedIn, function(req,res,err){
  var estimacion_id = req.params.id;
  var usuario = req.user;
  console.log(estimacion_id)
  var getEstimacion = 'SELECT estimaciones.*,obras.nombre_obra,proveedores.razon_social FROM estimaciones JOIN obras ON estimaciones.obra = obras.obra_id JOIN proveedores ON proveedores.id = estimaciones.proveedor_id WHERE estimaciones_id = ?';
  var getEstimacionArticulos = 'SELECT estimacion_articulo.*,conceptos.nombre_concepto,zonas.nombre_zona FROM estimacion_articulo JOIN conceptos ON estimacion_articulo.concepto_id = conceptos.conceptos_id JOIN zonas ON estimacion_articulo.zona_id = zonas.zonas_id WHERE estimacion_id = ?';
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
                res.render('estimacion',{estimacion:estimacion, articulos:articulos, usuario:usuario});
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

router.get('/signature/:categoria/:id', isLoggedIn, function(req,res,err){
  var usuario = req.user;
  var categoria = req.params.categoria;
  var estimacion_id = req.params.id;
  res.render('signature',{usuario:usuario, categoria:categoria, estimacion_id:estimacion_id})
})
//OBRAS

router.get('/obras',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var listaObras = 'SELECT obras.*, empleados.nombre, empleados.id, usuarios.categoria  FROM obras LEFT JOIN empleados ON empleados.obra = obras.obra_id LEFT JOIN usuarios ON usuarios.empleado_id = empleados.id WHERE usuarios.categoria = "residente"';
    db.query(listaObras, function(err, obras){
    if(err) throw err;
    else {
      console.log(obras)
      res.render('obras', { title: 'Obras', obras: obras, usuario:usuario });
    }
  });
});

router.get('/obra/:obraid', isLoggedIn, function(req, res, next) {
  var obra_id = req.params.obraid;
  var usuario = req.user;
  var getObra = 'SELECT * FROM obras WHERE obra_id = ?;';
  var getEmpleados = 'SELECT * FROM empleados WHERE obra = ?;';
  var getPresupuesto = 'SELECT presupuestos.*,conceptos.nombre_concepto,zonas.nombre_zona FROM presupuestos JOIN conceptos ON presupuestos.concepto = conceptos.conceptos_id JOIN zonas ON presupuestos.zona = zonas.zonas_id WHERE obra = ? ORDER BY zona;';
    db.query(getObra,[obra_id], function(err, obra){
    if(err) throw err;
    else {
        db.query(getPresupuesto,[obra_id], function(err, presupuestos){
        if(err) throw err;
        else {
              db.query(getEmpleados,[obra_id], function(err, empleados){
              if(err) throw err;
              else {
                res.render('obra', { title: obra[0].nombre_obra, obra: obra[0], presupuestos:presupuestos,empleados:empleados, usuario:usuario });
              }
            });
        }
      });
    }
  });
});

router.get('/obras/nueva',isLoggedIn, function(req,res,err){
  var usuario = req.user;
  var infoObras = 'SELECT usuarios.empleado_id, empleados.nombre FROM usuarios JOIN empleados ON usuarios.empleado_id = empleados.id WHERE categoria = "residente"';
    db.query(infoObras, function(err, info){
      console.log(info)
    if(err) throw err;
    else {
        res.render('obranueva', { title: 'Obras', info: info, usuario:usuario });
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


//PRESUPUESTOS
router.get('/presupuestos', function(err,res){
  var infoObras = 'SELECT * FROM obras WHERE presupuesto = "N"';
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

//ACARREOS

router.get('/acarreos', function(err,res){
  var listaAcarreos = 'SELECT acarreos.*, camiones.*, proveedores.razon_social, materiales.concepto, materiales.precio, materiales.proveedor_id, conceptos.nombre_concepto, recibos.hora,recibos.foto FROM acarreos LEFT JOIN camiones ON camiones.camion_id = acarreos.camion_id LEFT JOIN recibos ON acarreos.recibo_id = recibos.recibo_id LEFT JOIN materiales ON materiales.id = acarreos.material_id LEFT JOIN proveedores ON camiones.proveedor_id = proveedores.id OR materiales.proveedor_id = proveedores.id LEFT JOIN conceptos ON materiales.concepto=conceptos.conceptos_id OR acarreos.concepto_flete = conceptos.conceptos_id ORDER BY recibo_id, categoria DESC';
    db.query(listaAcarreos, function(err, acarreos){
    if(err) throw err;
    else {
        res.render('acarreos', { title: 'Acarreos', acarreos: acarreos });
    }
  });
})

//PROVEEDORES
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

//MATERIALES
router.get('/materiales', function(req, res, next) {
  var usuario = req.user;
  var readTable = 'SELECT materiales.*, conceptos.nombre_concepto, proveedores.razon_social FROM materiales LEFT JOIN proveedores ON proveedores.id = materiales.proveedor_id JOIN conceptos ON conceptos.conceptos_id = materiales.concepto';
  var getProveedores = 'SELECT * FROM proveedores';
  var getObras = 'SELECT * FROM obras';

    db.query(readTable, function(err, info){
    if(err) throw err;
    else {
        var readConceptos = 'SELECT * FROM conceptos'
        db.query(readConceptos, function(err, conceptos){
        if(err) throw err;
        else {
            db.query(getProveedores, function(err, proveedores){
              if(err) throw err;
              else {
              db.query(getObras, function(err, obras){
                  if(err) throw err;
                  else {
                    res.render('materiales', { title: 'Materiales', info: info, proveedores:proveedores,conceptos:conceptos, obras:obras,usuario:usuario });
                  }
                });
              }
            });
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

//EMPLEADOS

router.get('/empleados', function(req, res, next) {
  var usuario = req.user;
    rp(path+'api/empleados').then( function (body,err) {
  if (!err) {
    var empleados = JSON.parse(body);
    res.render('empleados', { title: 'Empleados', empleados: empleados, usuario:usuario });
  }
})
});

router.get('/empleados/nuevo', function(req, res, next) {
  var readTable = 'SELECT * FROM obras';
    db.query(readTable, function(err, obras){
    if(err) throw err;
    else {
      res.render('nuevoempleado', { title: 'Empleados', obras: obras });
    }
  });
});

router.get('/empleados/editar/:idempleado', function(req, res, next) {
  var empleado_id = req.params.idempleado;
  var obras;
  var empleado;
  rp.get(path+'api/obras').then(function (response) {
    if (response) {
    obras = JSON.parse(response);
    console.log(obras)
      return rp.get(path+'api/empleados/'+empleado_id)
    }
  }).then(function (response) {
        if (response) {
          response = JSON.parse(response);
          empleado = response[0];
          console.log(empleado);
           return res.render('editarempleado',{obras:obras,empleado:empleado});
        }
      })
});

router.get('/registrar/:idempleado', function(req, res, next) {
  var empleado_id = req.params.idempleado;
  var getEmpleado = 'SELECT * FROM empleados WHERE id = ?';
    db.query(getEmpleado,[empleado_id], function(err, empleado){
    if(err) throw err;
    else {
      res.render('register', { title: 'Register', empleado:empleado });
    }
  });
});

//CAMIONES
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
  var getCamion = "SELECT * FROM `camiones` WHERE `camion_id` = " + id;
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



