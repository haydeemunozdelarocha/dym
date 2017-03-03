var express = require('express');
var router = express.Router();
var request =   require('request');
var fs = require('fs');
var moment= require('moment');
var S3FS = require('s3fs');
var session = require('express-session');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var db = require('../db.js');

var fsImpl = new S3FS('dymingenieros', {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

function firmaCostos(numero,obra,estimacion_id) {
  console.log(numero,obra,estimacion_id)
    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'Gmail',
        auth: {
            user: 'haydeemunozdelarocha@gmail.com', // Your email id
            pass: 'Socorro000' // Your password
        }
    }));
    var text = '<h2>Status estimación</h2><p>La estimación No.'+numero+' de '+obra+' ha sido creada y autorizada por el residente y el contratista. <a href="/estimaciones/'+estimacion_id+'">Haz click aquí para firmar >>.</a>';
    var mailOptions = {
    from: 'haydeemunozdelarocha@gmail.com', // sender address
    to: 'haydee.mr0@hotmail.com', // list of receivers
    subject: 'Estimación No. '+numero+' de '+obra, // Subject line
    html: text // You can choose to send an HTML body instead
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);

    }else{
        console.log('Message sent: ' + info.response);
    };
});
}

router.post('/', function(req, res, err) {
  console.log('getting photo')
  // if (req.user.accessToken){
  var auth_token = req.user.accessToken;
  console.log(auth_token)
  var turnurl = 'https://developer-api.nest.com/devices/cameras/kUsIR2xqhGOE1qSFmTwvoht6XfYl5Xg2D2Fz36ahWExT0nf3aQB2jQ';
  var url='https://www.dropcam.com/api/wwn.get_snapshot/CjZrVXNJUjJ4cWhHT0UxcVNGbVR3dm9odDZYZllsNVhnMkQyRnozNmFoV0V4VDBuZjNhUUIyalESFkFMbS1GV2JXVUNwTFlINi1hcGNYckEaNkF3TnM5cXlKamxERVYwdVhnLUM2b3J6cDg3ZGNfV05mM1BYVXRRTm1GRGF1eGhJR1JVY3J3UQ?auth='+auth_token;
  var photo;
  console.log(url)
  var options = {
  url: url,
  encoding: 'binary',
  headers: {
    'Authorization': 'Bearer '+ auth_token,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}
var turnOn = {
  method: 'PUT',
  url: turnurl,
  headers: {
    'Authorization': 'Bearer '+ auth_token,
    'Content-Type': 'application/json'
  },
  body:{'is_streaming': true}
};

function callback(error, response, body) {
  if(error){
    res.json("Camera offline")
  }
  if (!error && response.statusCode == 200) {
    if(!body){
      res.json("Camera offline")
    }
    body = new Buffer(body, 'binary');
    var date= Date.now();
    var hora = moment(date).format("DD-MM-YYYY-hh-mm");
    var path =''+hora+'.jpg';
    photo="https://s3.amazonaws.com/dymingenieros/"+path;
           fsImpl.writeFile(path, body, {"ContentType":"image/jpeg", "ContentEncoding":"Binary"}, function(err){
            if (err) throw err
            console.log('File saved.')
          res.json(photo)
        })

  }
}

request(options, callback)


});


router.post('/convertir', function(req, res, err) {
  console.log('converting');
    console.log(req.body)
  var url = req.body.url;
  var id = req.body.id;
    // read binary data
request.get({url:url, encoding:'base64'}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
      res.send('data:image/jpeg;base64,'+body)
    }
});
})

router.post('/signature', function(req, res, err) {
  console.log('getting photo')
  var categoria = req.body.categoria;
  var estimacion_id = req.body.estimacion_id;
  var obra = req.body.obra;
  var numero = req.body.numero;
  var body = req.body.image;
  var nombre_col;
  var status;
      console.log(body)
    body = body.split(",")[1];

    body = new Buffer(body, 'base64');
    var date= Date.now();
    var hora = moment(date).format("DD-MM-YYYY-hh-mm");
    var path ='signature/'+hora+'.jpg';
    photo="https://s3.amazonaws.com/dymingenieros/"+path;
           fsImpl.writeFile(path, body, {"ContentType":"text/plain", "ContentEncoding":"base64"}, function(err){
            if (err) throw err
            console.log('File saved.')
          if(categoria === "1"){
            nombre_col = "firma_contratista";
          } else if (categoria === "2"){
            nombre_col = "firma_residente"
          } else if (categoria === "3"){
            nombre_col = "autorizacion";
          }
          console.log(photo, estimacion_id)
          var agregarFirma = 'UPDATE estimaciones SET '+nombre_col+'= ? WHERE estimaciones_id = ?;SELECT estimaciones.firma_residente, estimaciones.firma_contratista,estimaciones.autorizacion FROM estimaciones WHERE estimaciones_id = ?';
          db.query(agregarFirma,[photo, estimacion_id,estimacion_id], function(err,firma){
            console.log(firma[1][0])
            if (firma[1][0].firma_contratista && firma[1][0].firma_residente) {
              console.log('email reyes');
              firmaCostos(numero,obra,estimacion_id)
            } else if (firma[1][0].firma_contratista && firma[1][0].firma_residente && firma[1][0].autorizacion) {
              console.log('change status and email papa')
            } else if (firma[1][0].firma_contratista && firma[1][0].autorizacion) {
              console.log('email residente')
            }
            res.json({photo:photo})
          })
        })

  })






module.exports = router;
