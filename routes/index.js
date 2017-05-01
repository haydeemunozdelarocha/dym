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
      console.log('logged in')
      console.log(req.user)
      next();
    } else{
      res.redirect('/login');
    }
};

function checkAuthToken(req, res, next) {
    if(!req.user.accessToken && req.user.categoria === 'checador') {
      res.cookie('user', req.user,{ maxAge: 900000 });
      return res.redirect('/users/auth/nest')
    } else if (req.user.categoria === 'checador') {
      next()
    } else {
      res.redirect('/')
    }
}

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

/* MAIN VIEWS */
router.get('/',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  console.log('usuario')
  console.log(req.user)
  if(req.user.categoria === "checador"){
    res.redirect('/captura')
  } else if (req.user.categoria === "residente"){
    res.redirect('/obra/'+req.user.obra_id)
  } else if (req.user.categoria === "administrador"){
    res.redirect('/administrador')
  } else {
    res.redirect('/logout')
  }
});

router.get('/administrador', isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var getObras = 'SELECT * FROM obras ORDER BY obra_id ASC;';
  var getEstimaciones = 'SELECT estimaciones.*,obras.nombre_obra FROM estimaciones JOIN obras ON estimaciones.obra = obras.obra_id WHERE status = "por autorizar";';
  var getPresupuesto = 'SELECT presupuestos.obra,obras.nombre_obra, sum(cantidad) AS total_concepto, sum(acumulado) AS total_costo FROM presupuestos JOIN obras ON presupuestos.obra = obras.obra_id GROUP BY obra;';
    db.query(getObras, function(err, obras){
    if(err) throw err;
    else {
      var obra_id = obras[0].obra_id;
        db.query(getPresupuesto, function(err, presupuestos){
        if(err) throw err;
        else {
              db.query(getEstimaciones, function(err, estimaciones){
              if(err) throw err;
              else {
                res.render('costosdashboard', { title: 'Costos',  presupuestos:presupuestos,estimaciones:estimaciones, usuario:usuario });
              }
            });
        }
      });
    }
  });
});

//LOGIN & LOGOUT
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'DYM INGENIEROS CONSTRUCTORES', message: req.flash('error')[0]});
});

router.get('/logout', function(req, res, next) {
  req.logout();
  console.log(req.user)
  res.redirect('/login');
});

//CAPTURA DE ACARREOS
router.get('/captura', [isLoggedIn,checkAuthToken], function(req, res){
  var obra_id =req.user.obra_id;
  var infoProveedores = 'SELECT proveedores.id,proveedores.razon_social FROM materiales LEFT JOIN proveedores ON proveedores.id = materiales.proveedor_id WHERE obra_id = ? GROUP BY razon_social; SELECT obras_zonas.zona,zonas.nombre_zona FROM zonas LEFT JOIN obras_zonas ON zonas.zonas_id = obras_zonas.zona  WHERE obra = ?;'
    db.query(infoProveedores,[obra_id,obra_id], function(err, info){
    if(err) throw err;
    else {
        res.render('captura', { title: 'Acarreos', proveedores: info[0],zonas:info[1] });
    }
  });
})

router.get('/resumen', [isLoggedIn,checkAuthToken], function(req, res){
        res.render('resumen', {message:''});
})

router.get('/recibo/:id',isLoggedIn, function(req, res, next) {
  var id = req.params.id;
  var readTable = 'SELECT acarreos_flete.recibo_id,acarreos_flete.cantidad,recibos.hora,zonas.nombre_zona,camiones.camion_id,camiones.placas, camiones.modelo,camiones.unidad_camion, bp.razon_social AS nombre_fletero,bc.razon_social  AS nombre_banco, conceptos.nombre_concepto FROM acarreos_flete JOIN recibos ON acarreos_flete.recibo_id = recibos.recibo_id LEFT JOIN camiones ON recibos.camion_id = camiones.camion_id LEFT JOIN fletes ON acarreos_flete.flete_id = fletes.fletes_id LEFT JOIN proveedores AS bp ON bp.id = camiones.proveedor_id LEFT JOIN proveedores AS bc ON bc.id = fletes.banco LEFT JOIN conceptos ON conceptos.conceptos_id = acarreos_flete.concepto_flete LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN banco ON acarreos_flete.banco_id = banco.banco_id WHERE acarreos_flete.recibo_id = ?;';
          db.query(readTable,[id,id], function(err, acarreos){
            if(err) throw err;
            else {
                var data = {flete:acarreos};
              res.render('recibo', data)
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
      var query = '';
      if(req.user.categoria === "residente"){
        query = ' WHERE estimaciones.obra = '+req.user.obra_id+' AND ';
      } else if(req.params.obra_id){
        query = ' WHERE estimaciones.obra = '+req.query.obra_id+' AND ';
      } else if(req.user.categoria !== "residente"){
        if (Object.keys(req.query).length == 0){
        query = "";
        }else {
           query = "WHERE ";
        }
      }
      if(req.query.proveedor){
        query = query + ' estimaciones.proveedor_id ='+req.query.proveedor+' AND ';
      }
      if(req.query.date1 && req.query.date2){
          var date1 = req.query.date1+' 00:00';
          var date2 = req.query.date2+' 00:00';
            query = query +' estimaciones.fecha BETWEEN "'+date1+'" AND "'+date2+'" AND ';
      }
      if(req.query.numero){
        query = query + ' estimaciones.numero ='+req.query.numero+' AND ';
      }
      if(req.query.pagada){
        query = query + ' estimaciones.pagado ="'+req.query.pagada+'" AND ';
      }
      var getProveedores = 'SELECT * FROM proveedores';
      var getObras = 'SELECT * FROM obras';
      var getEstimaciones = 'SELECT estimaciones.*,obras.nombre_obra,proveedores.razon_social FROM estimaciones JOIN obras ON estimaciones.obra = obras.obra_id JOIN proveedores ON estimaciones.proveedor_id = proveedores.id '+query+';';
      if(getEstimaciones[getEstimaciones.length - 5] === 'A' && getEstimaciones[getEstimaciones.length - 2] === ' '){
        console.log(getEstimaciones.length)
        console.log(getEstimaciones.length - 5)
        getEstimaciones = getEstimaciones.slice(0,getEstimaciones.length - 5);
      }
      console.log(getEstimaciones)
          db.query(getProveedores, function(err, proveedores){
            if(err) throw err;
            else {
                db.query(getObras, function(err, obras){
                if(err) throw err;
                else {
                      db.query(getEstimaciones, function(err, estimaciones){
                        if(err) throw err;
                        else {
                          if(estimaciones.length == 0){
                            var message = "No se encontraron estimaciones con ésta información."
                          }
                              res.render('estimaciones', { title: 'Estimaciones', estimaciones: estimaciones, usuario: usuario, obras:obras, proveedores: proveedores, message: message });
                            }
                          })
                    }
                  })
        }
      })
})



router.get('/estimaciones/imprimir/:id',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var estimacion_id = req.params.id;
  var residenteURL;
  var contratistaURL;
  var autorizacionURL;
  var firmaResidente;
  var firmaContratista;
  var autorizacion;
  var getEstimacion = 'SELECT estimaciones.*,obras.nombre_obra,proveedores.razon_social FROM estimaciones JOIN obras ON estimaciones.obra = obras.obra_id JOIN proveedores ON proveedores.id = estimaciones.proveedor_id WHERE estimaciones_id = ?';
  var getEstimacionArticulos = 'SELECT estimacion_articulo.*,conceptos.nombre_concepto,zonas.nombre_zona FROM estimacion_articulo JOIN conceptos ON estimacion_articulo.concepto_id = conceptos.conceptos_id JOIN zonas ON estimacion_articulo.zona_id = zonas.zonas_id WHERE estimacion_id = ?';
    db.query(getEstimacion,[estimacion_id], function(err, estimacion){
    if(err) throw err;
    else {
        if(estimacion[0].firma_residente){
          firmaResidente = {
              method: 'GET',
              uri: estimacion[0].firma_residente,
              encoding: null, //  if you expect binary data
              responseType: 'buffer'
          };
        }
           if(estimacion[0].firma_contratista){
          firmaContratista = {
              method: 'GET',
              uri: estimacion[0].firma_contratista,
              encoding: null, //  if you expect binary data
              responseType: 'buffer'
          };
        }
          if(estimacion[0].autorizacion){
            console.log(estimacion[0].autorizacion)
          autorizacion = {
              method: 'GET',
              uri: estimacion[0].autorizacion,
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
            if(estimacion[0].autorizacion){
              return rp(autorizacion)
            } else {
              return
            }
          }).then(function (repos) {
            console.log(repos);
            if(repos){
              autorizacionURL = 'data:image/png;base64,'+repos.toString('base64')

            }
            console.log(autorizacionURL)
            if(!repos){
              autorizacionURL = '';
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
                    {image: 'data:image/png;base64,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',
                      width:150,style:'logo'},
                    {text: 'Numero '+estimacion[0].estimaciones_id, style: 'subheader'},
                    {text: 'Obra '+estimacion[0].nombre_obra, style: 'subheader'},
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
                        widths: [200, 200, 200],
                        body: [[
                        {
                      image: residenteURL,
                        width: 200
                    },
                    {
                      image: contratistaURL,
                        width: 200
                    },
                    {
                      image: autorizacionURL,
                        width: 200
                    }],
                    [
                    {
                      text: 'Residente'
                    },
                    {
                      text: 'Contratista'
                    },
                    {
                      text: 'Ing Reyes'
                    }]]
                      },
                       alignment: 'left',
                      layout: 'noBorders'
                    }
                  ],
                  styles: {
                    header: {
                      fontSize: 18,
                      bold: true,
                      margin: [0, 0, 0, 10]
                    },
                    logo:{
                      alignment:'left'
                    },
                    subheader: {
                      fontSize: 16,
                      bold: true,
                      margin: [0, 10, 0, 5],
                      alignment: 'right'
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

router.get('/estimaciones/nueva',isLoggedIn, function(req, res, next) {
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

router.get('/estimaciones/editar/:id',isLoggedIn, function(req, res, next) {
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
});

router.get('/signature/:categoria/:id/:obra', isLoggedIn, function(req,res,err){
  var usuario = req.user;
  var categoria = req.params.categoria;
  var estimacion_id = req.params.id;
  var obra = req.params.obra;
  res.render('signature',{usuario:usuario, categoria:categoria, obra:obra,estimacion_id:estimacion_id})
})
//OBRAS

router.get('/obras',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var listaObras = 'SELECT obras.*, empleados.nombre, empleados.id, usuarios.categoria FROM obras LEFT JOIN empleados ON empleados.id = obras.residente_id LEFT JOIN usuarios ON usuarios.empleado_id = empleados.id WHERE usuarios.categoria = "residente"';
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
  var infoObras = 'SELECT usuarios.empleado_id, empleados.nombre FROM usuarios JOIN empleados ON usuarios.empleado_id = empleados.id WHERE categoria = "residente"; SELECT * FROM zonas;';
    db.query(infoObras, function(err, info){
      console.log(info)
    if(err) throw err;
    else {
        res.render('obranueva', { title: 'Obras', info: info[0], zonas: info[1], usuario:usuario });
    }
  });
})

router.get('/obras/editar/:idobra',isLoggedIn, function(req,res,err){
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
router.get('/presupuestos',isLoggedIn, function(req,res,err){
  var usuario = req.user;
  var infoObras = 'SELECT * FROM obras WHERE presupuesto = "N"; SELECT * FROM conceptos;SELECT * FROM zonas;SELECT presupuestos.*, conceptos.*, zonas.*, obras.* FROM presupuestos JOIN obras ON presupuestos.obra=obras.obra_id JOIN zonas ON presupuestos.zona = zonas.zonas_id JOIN conceptos ON presupuestos.concepto = conceptos.conceptos_id;';
    db.query(infoObras, function(err, info){
      if(err) throw err;
      else {
        res.render('presupuestonuevo', { title: 'Presupuesto', obras: info[0], conceptos: info[1], usuario:usuario, zonas: info[2], presupuestos: info[3] });
      }
  });

});

router.get('/presupuestos/:id',isLoggedIn, function(req,res,err){
  var usuario = req.user;
  var obra_id = req.params.id;
  var infoObras = 'SELECT nombre_zona,zonas_id FROM obras_zonas JOIN zonas ON zona = zonas.zonas_id WHERE obra = ?; SELECT * FROM conceptos;SELECT presupuestos.*, conceptos.*, zonas.*, obras.* FROM presupuestos JOIN obras ON presupuestos.obra=obras.obra_id JOIN zonas ON presupuestos.zona = zonas.zonas_id JOIN conceptos ON presupuestos.concepto = conceptos.conceptos_id;';
    db.query(infoObras,[obra_id],function(err, info){
      if(err) throw err;
      else {
        console.log(info[0])
              res.render('presupuestonuevo', { title: 'Presupuesto', obras: info[0],obra_id:obra_id, conceptos: info[1], usuario:usuario, zonas: info[0], presupuestos: info[2] });
            }
        });

});



//ACARREOS

router.get('/acarreos',isLoggedIn, function(req,res,err){
  var usuario = req.user;
  var obra_query='';
  var concepto_query='';
  var query_zona='';
  var recibo_query='';
  var estimacion_query='';
  var proveedor_query='';
  var fecha_query = '';
  var query = '';
  var query2 = '';

  if(Object.keys(req.query).length === 0 && req.query.constructor === Object){
        console.log('no query')
          if(usuario.categoria === 'residente'){
              obra_query = 'WHERE recibos.obra_id = '+usuario.obra_id;
            }
          var listaAcarreos = "SELECT 'Flete' As Type, acarreos_flete.recibo_id,razon_social,cantidad, nombre_concepto, total_flete,estimacion,hora,nombre_zona,foto FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id  JOIN camiones ON recibos.camion_id = camiones.camion_id JOIN proveedores ON proveedores.id = camiones.proveedor_id UNION SELECT 'Material', acarreos_material.recibo_id,razon_social,cantidad, nombre_concepto, total_material,estimacion,hora,nombre_zona,foto FROM acarreos_material JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_material.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id JOIN materiales ON materiales.id = acarreos_material.material_id JOIN proveedores ON proveedores.id = acarreos_material.banco_id "+obra_query+" ORDER BY recibo_id;SELECT obra_id,nombre_obra FROM obras;SELECT zonas_id,nombre_zona FROM zonas;SELECT id,razon_social FROM proveedores;SELECT conceptos_id,nombre_concepto FROM conceptos;";
  } else {
          console.log('has query')
          //Get obra query
      if(req.query.recibo_id){
        query = '';
        query = query +'WHERE recibos.recibo_id ='+req.query.recibo_id;
        query2 = '';
        query2 = query2 +' WHERE recibos.recibo_id ='+req.query.recibo_id;
                                var listaAcarreos = "SELECT 'Flete' As Type, acarreos_flete.recibo_id,razon_social,cantidad, nombre_concepto, total_flete,estimacion,hora,nombre_zona,foto FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id  JOIN camiones ON recibos.camion_id = camiones.camion_id JOIN proveedores ON proveedores.id = camiones.proveedor_id "+query2+" UNION SELECT 'Material', acarreos_material.recibo_id,razon_social,cantidad, nombre_concepto, total_material,estimacion,hora,nombre_zona,foto FROM acarreos_material JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_material.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id JOIN materiales ON materiales.id = acarreos_material.material_id JOIN proveedores ON proveedores.id = materiales.proveedor_id "+query+" ORDER BY recibo_id;SELECT obra_id,nombre_obra FROM obras;SELECT zonas_id,nombre_zona FROM zonas;SELECT id,razon_social FROM proveedores;SELECT conceptos_id,nombre_concepto FROM conceptos;";
      } else {
              console.log('no recibo')
            if(usuario.categoria !== 'residente' && req.query.obra_id){
              console.log('has obra query')
              obra_query = 'WHERE recibos.obra_id = '+req.query.obra_id;
              query = query + obra_query;
              query2 = query2 + obra_query;
            } else {
              console.log('residente')
              query = 'WHERE recibos.obra_id = '+usuario.obra_id;
              query2 = 'WHERE recibos.obra_id = '+usuario.obra_id;
              }
            //IF categoria
                if(req.query.categoria){
                      console.log('if categoria')
                      if(req.query.date1 && req.query.date2){
                            var date1 = req.query.date1+' 00:00';
                            var date2 = req.query.date2+' 00:00';
                            fecha_query = fecha_query +'recibos.hora BETWEEN "'+date1+'" AND "'+date2+'" ';
                            query = query + ' AND '+ fecha_query;
                      }
                      if(req.query.zona){
                          query_zona = query_zona +'recibos.zona_id = '+req.query.zona+' ';
                          query = query + ' AND '+ query_zona;
                      }
                      if(req.query.categoria === "flete"){
                        console.log('flete')
                              if(req.query.estimacion){
                                    estimacion_query = estimacion_query + 'acarreos_flete.concepto_flete ="'+req.query.concepto+'" ';
                                    query = query + ' AND '+ estimacion_query;
                                  }
                                if(req.query.proveedor){
                                proveedor_query = proveedor_query +'camiones.proveedor_id = '+req.query.proveedor+' ';
                                query = query + ' AND '+ proveedor_query;
                                }
                                if(req.query.concepto){
                                query_concepto = query_concepto+'acarreos_flete.concepto_flete ='+req.query.concepto+' ';
                                  query = query + ' AND '+ query_concepto;
                                }
                          listaAcarreos = 'SELECT "Flete" As Type, acarreos_flete.recibo_id,razon_social,cantidad, nombre_concepto, total_flete,estimacion,hora,nombre_zona,foto,camiones.proveedor_id, recibos.obra_id FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id JOIN camiones ON recibos.camion_id = camiones.camion_id JOIN proveedores ON proveedores.id = camiones.proveedor_id '+query+'ORDER BY recibo_id;SELECT obra_id,nombre_obra FROM obras;SELECT zonas_id,nombre_zona FROM zonas;SELECT id,razon_social FROM proveedores;SELECT conceptos_id,nombre_concepto FROM conceptos;';
                        } else {
                          console.log('material')
                            if(req.query.concepto){
                                  query_concepto = query_concepto +'acarreos_material.concepto_material ='+req.query.concepto+' ';
                                  query = query + ' AND '+ query_concepto;
                                  query2 = query2 + ' AND '+ query_concepto;
                            }
                            if(req.query.estimacion){
                                  estimacion_query = estimacion_query +' acarreos_material.concepto_material ="'+req.query.estimacion+'" ';
                                  query = query + ' AND '+ estimacion_query;
                            }
                            if(req.query.proveedor){
                                  proveedor_query = proveedor_query +'acarreos_material.banco_id = '+req.query.proveedor+' ';
                                  query = query + ' AND '+ proveedor_query;
                            }
                            listaAcarreos = "SELECT 'Material' As Type, acarreos_material.recibo_id,razon_social,cantidad, nombre_concepto, total_material,estimacion,hora,nombre_zona,foto FROM acarreos_material JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_material.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id JOIN materiales ON materiales.id = acarreos_material.material_id JOIN proveedores ON proveedores.id = acarreos_material.banco_id "+query+"ORDER BY recibo_id;SELECT obra_id,nombre_obra FROM obras;SELECT zonas_id,nombre_zona FROM zonas;SELECT id,razon_social FROM proveedores;SELECT conceptos_id,nombre_concepto FROM conceptos;";
                            }
                } else {
                      console.log('no categoria')
                        if(req.query.date1 && req.query.date2){
                          var date1 = req.query.date1+' 00:00';
                          var date2 = req.query.date2+' 00:00';
                          query = query +' AND recibos.hora BETWEEN "'+date1+'" AND "'+date2+'" ';
                          query2 = query2 +' AND recibos.hora BETWEEN "'+date1+'" AND "'+date2+'" ';
                          }
                          if(req.query.zona){
                          query = query +'AND recibos.zona_id = '+req.query.zona+' ';
                          query2 = query2 +'AND recibos.zona_id = '+req.query.zona+' ';
                          }
                          if(req.query.proveedor){
                          query = query +' AND acarreos_material.banco_id = '+req.query.proveedor+' ';
                          query2 = query2 +' AND camiones.proveedor_id = '+req.query.proveedor+' ';
                          }
                          if(req.query.concepto){
                          query = query +' AND acarreos_material.concepto_material ='+req.query.concepto+' ';
                          query2 = query2+' AND acarreos_flete.concepto_flete ='+req.query.concepto+' ';
                          }
                          if(req.query.estimacion){
                          query = query +' AND acarreos_material.estimacion ="'+req.query.estimacion+'" ';
                          query2 = query2+' AND acarreos_flete.estimacion ="'+req.query.estimacion+'" ';
                          }
                         var listaAcarreos = "SELECT 'Flete' As Type, acarreos_flete.recibo_id,razon_social,cantidad, nombre_concepto, total_flete,estimacion,hora,nombre_zona,foto FROM acarreos_flete JOIN conceptos ON acarreos_flete.concepto_flete = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_flete.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id  JOIN camiones ON recibos.camion_id = camiones.camion_id JOIN proveedores ON proveedores.id = camiones.proveedor_id "+query2+" UNION SELECT 'Material', acarreos_material.recibo_id,razon_social,cantidad, nombre_concepto, total_material,estimacion,hora,nombre_zona,foto FROM acarreos_material JOIN conceptos ON acarreos_material.concepto_material = conceptos.conceptos_id JOIN recibos ON recibos.recibo_id = acarreos_material.recibo_id JOIN zonas ON zonas.zonas_id = recibos.zona_id JOIN materiales ON materiales.id = acarreos_material.material_id JOIN proveedores ON proveedores.id = acarreos_material.banco_id "+query+" ORDER BY recibo_id;SELECT obra_id,nombre_obra FROM obras;SELECT zonas_id,nombre_zona FROM zonas;SELECT id,razon_social FROM proveedores;SELECT conceptos_id,nombre_concepto FROM conceptos;";
            }
        }
          console.log(query);
          console.log(query2);
      }
    console.log(listaAcarreos)
    db.query(listaAcarreos, function(err, rows){
    if(err) throw err;
    else {
      var acarreos = rows[0];
      var obras = rows[1];
      var zonas = rows[2];
      var proveedores = rows[3];
      var conceptos = rows[4];
      if(rows[0].length == 0){
        var message = "No se encontraron acarreos con esa información."
      }
      res.render('acarreos', { title: 'Acarreos', usuario:usuario,acarreos: acarreos, obras:obras,zonas:zonas,conceptos:conceptos,proveedores:proveedores,message:message });
    }
  });
})

router.get('/acarreos/:id',isLoggedIn, function(req,res,err){
  var usuario = req.user;
  if(usuario.categoria === 'residente'){
    var obra = 'WHERE recibos.obra_id = '+usuario.obra_id+' ';
  } else if (req.query.obra_id){
    var obra = req.query.obra_id;
  } else {
    var obra = '';
  }
var id = req.params.id;
obra = obra +'AND acarreos.acarreo_id ='+ id;

  var listaAcarreos = 'SELECT recibos.recibo_id,recibos.hora,recibos.foto, acarreos.estimacion,acarreos.acarreo_id,acarreos.categoria,proveedores.razon_social, conceptos.nombre_concepto,zonas.nombre_zona FROM acarreos JOIN recibos ON recibos.recibo_id = acarreos.recibo_id LEFT JOIN zonas ON recibos.zona_id = zonas.zonas_id LEFT JOIN camiones ON acarreos.camion_id = camiones.camion_id LEFT JOIN materiales ON acarreos.material_id = materiales.id JOIN proveedores ON camiones.proveedor_id = proveedores.id OR materiales.proveedor_id = proveedores.id LEFT JOIN conceptos ON acarreos.concepto_flete=conceptos.conceptos_id OR materiales.concepto = conceptos.conceptos_id '+obra;

    db.query(listaAcarreos, function(err, acarreos){
    if(err) throw err;
    else {
      console.log(acarreos)
        res.render('acarreo', { title: 'Acarreo', usuario:usuario,acarreos: acarreos[0] });
    }
  });
})

//PROVEEDORES
router.get('/proveedores',isLoggedIn, function(req, res, next) {
  var readTable = 'SELECT * FROM proveedores';
  var usuario = req.user;
    db.query(readTable, function(err, proveedores){
    if(err) throw err;
    else {
      res.render('proveedores', { title: 'Proveedores', proveedores: proveedores,usuario:usuario });
    }
  });
});

router.get('/proveedores/nuevo',isLoggedIn, function(req,res,err){
  var infoProveedores = 'SELECT * FROM proveedores';
    var usuario = req.user;
    db.query(infoProveedores, function(err, info){
    if(err) throw err;
    else {
        res.render('proveedornuevo', { title: 'Obras', info: info, usuario:usuario });
    }
  });
})

router.get('/proveedores/editar/:id',isLoggedIn, function(req,res,err){
  var id =req.params.id;
  var usuario = req.user;
  var getProveedor = "SELECT * FROM `proveedores` WHERE `id` = "+ id;
    db.query(getProveedor, function(err, proveedor){
    if(err) throw err;
    else {
        res.render('editarproveedor', { title: 'Editar Proveedor', proveedor: proveedor, usuario:usuario });
    }
  });
})

//MATERIALES
router.get('/materiales',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var readTable = 'SELECT materiales.*, conceptos.nombre_concepto, proveedores.razon_social FROM materiales LEFT JOIN proveedores ON proveedores.id = materiales.proveedor_id JOIN conceptos ON conceptos.conceptos_id = materiales.concepto;SELECT * FROM conceptos;SELECT * FROM proveedores;SELECT * FROM obras;';

    db.query(readTable, function(err, info){
        if(err) throw err;
        else {
          res.render('materiales', { title: 'Materiales', info: info[0], proveedores:info[2],conceptos:info[1], obras:info[3],usuario:usuario });
        }
    });

});

router.get('/materiales/nuevo',isLoggedIn, function(req, res, next) {
  var readTable = 'SELECT * FROM proveedores';
  var usuario = req.user;
    db.query(readTable, function(err, proveedores){
    if(err) throw err;
    else {
      var readConceptos = 'SELECT * FROM conceptos'
        db.query(readConceptos, function(err, conceptos){
          if(err) throw err;
          else {
            res.render('nuevomaterial', { title: 'Proveedores', proveedores: proveedores, usuario:usuario,conceptos: conceptos });
          }
        });
    }
  });
});

router.get('/materiales/editar/:id',isLoggedIn, function(req, res, next) {
  var id = req.params.id;
    var usuario = req.user;
  var getMaterial = "SELECT materiales.id,materiales.unidad,materiales.precio,proveedores.razon_social,obras.nombre_obra,conceptos.nombre_concepto FROM materiales JOIN conceptos ON materiales.concepto = conceptos.conceptos_id JOIN obras ON materiales.obra_id = obras.obra_id JOIN proveedores ON materiales.proveedor_id = proveedores.id WHERE materiales.id = ?";
    db.query(getMaterial,[id], function(err, material){
    if(err) throw err;
    else {
      res.render('editarmaterial', { title: 'Editar Material', material: material,usuario:usuario });
    }
  });
});

//CONCEPTOS
router.get('/concepto/nuevo',isLoggedIn, function(req, res, err) {
  var usuario=req.user;
  var row = req.query.row;
      res.render('nuevoconcepto', { title: 'Conceptos', usuario:usuario, row:row});
});

//FLETES

router.get('/fletes',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  var readTable = 'SELECT a.*, bp.razon_social AS nombre_banco, a.proveedor_id, bc.razon_social AS nombre_proveedor FROM fletes AS a LEFT JOIN proveedores AS bp ON bp.id = a.banco LEFT JOIN proveedores AS bc ON bc.id = a.proveedor_id;SELECT * FROM proveedores;SELECT * FROM obras;';

    db.query(readTable, function(err, info){
        if(err) throw err;
        else {
          res.render('fletes', { title: 'Fletes', info: info[0], proveedores:info[1], obras:info[2],usuario:usuario });
        }
    });

});

//EMPLEADOS

router.get('/empleados',isLoggedIn, function(req, res, next) {
  var usuario = req.user;
  console.log(usuario)
  var listaEmpleados = 'SELECT empleados.*,obras.nombre_obra,usuarios.username FROM empleados LEFT JOIN obras ON empleados.obra = obras.obra_id LEFT JOIN usuarios ON empleados.id = usuarios.empleado_id';
  db.query(listaEmpleados, function(err, empleados){
    if(err) throw err;
    else {
    res.render('empleados', { title: 'Empleados', empleados: empleados, usuario:usuario, message:req.flash('error')[0]  });
    }
  });
});

router.get('/empleados/nuevo',isLoggedIn, function(req, res, next) {
  var readTable = 'SELECT * FROM obras';
  var usuario = req.user;
    db.query(readTable, function(err, obras){
    if(err) throw err;
    else {
      res.render('nuevoempleado', { title: 'Empleados', obras: obras,usuario:usuario });
    }
  });
});

router.get('/empleados/editar/:idempleado',isLoggedIn, function(req, res, next) {
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

router.get('/registrar/:idempleado',isLoggedIn, function(req, res, next) {
  var empleado_id = req.params.idempleado;
  var usuario = req.user;
  var getEmpleado = 'SELECT * FROM empleados WHERE id = ?';
    db.query(getEmpleado,[empleado_id], function(err, empleado){
    if(err) throw err;
    else {
      res.render('register', { title: 'Register',empleado:empleado,usuario:usuario});
    }
  });
});

//CAMIONES
router.get('/camiones',isLoggedIn, function(req, res, next) {
    var usuario = req.user;
  var readTable = 'SELECT camiones.*, proveedores.razon_social FROM camiones JOIN proveedores ON proveedores.id = camiones.proveedor_id';
    db.query(readTable, function(err, camiones){
    if(err) throw err;
    else {
      res.render('camiones', { title: 'Camiones', camiones: camiones,usuario:usuario });
    }
  });
});

router.get('/camiones/editar/:id',isLoggedIn, function(req, res, next) {
  var id = req.params.id;
    var usuario = req.user;
  var getCamion = "SELECT * FROM `camiones` WHERE `camion_id` = " + id;
    db.query(getCamion, function(err, camion){
    if(err) throw err;
    else {
      res.render('editarcamion', { title: 'Editar Camión', camion: camion,usuario:usuario });
    }
  });
});

router.get('/camiones/nuevo',isLoggedIn, function(req, res, next) {
    var usuario = req.user;
    var getProveedores = "SELECT * FROM `proveedores`";
    db.query(getProveedores, function(err, proveedores){
    if(err) throw err;
    else {
      res.render('nuevocamion', { title: 'Nuevo Camión', proveedores: proveedores, usuario:usuario });
    }
  });
});

module.exports = router;



