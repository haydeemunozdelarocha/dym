var express = require('express');
var GoPro = require('../lib/index.js');
var router = express.Router();
var WiFiControl = require('wifi-control');
var request =   require('request');
var dgram =     require('dgram');
var mac =       require('mac-address');
var fs = require('fs');
var moment= require('moment');
var S3FS = require('s3fs');
var session = require('express-session');

var fsImpl = new S3FS('dymingenieros', {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var cam = new GoPro.Camera();

  var _ap = {
    ssid: "INFINITUM4D20",
    password: process.env.WIFI_AP_PSS
  };

  var _bp = {
    ssid: "jacielgopro",
    password: process.env.WIFI_BP_PSS
  };

    var _cp = {
    ssid: "INFINITUM7874",
    password: process.env.WIFI_CP_PSS
  };
  var macAddress = "D89685F6C281";
  var ip = "10.5.5.9";
macAddress = macAddress.replace(/(..)(..)(..)(..)(..)(..)/,
                                                                      '$1:$2:$3:$4:$5:$6');
function turningOn(macAdress) {
    console.log('powering on');

console.log(macAdress)

        if (macAddress instanceof Buffer) {
            if (macAddress.length === mac.LENGTH) {
              console.log('buffer')
                return macAddress;
            } else {
                return null;
            }
        }
        if (macAddress instanceof Array) {
            if (macAddress.length === mac.LENGTH) {
              console.log('array')
                return Buffer.from(macAddress);
            } else {
                return null;
            }
        }
        console.log('none')
        macAddress = mac.toBuffer(macAddress);

    console.log(macAddress)
    var message = new Buffer(102);
    message[0] = 0xff;
    message[1] = 0xff;
    message[2] = 0xff;
    message[3] = 0xff;
    message[4] = 0xff;
    message[5] = 0xff;

    for (var j = 0; j < 16; ++j) {
        var c = 6 + j * macAddress.length;
        for (var i = 0; i < macAddress.length; ++i) {
            message[c + i] = macAddress[i];
        }
    }
    console.log(message)
    var client = dgram.createSocket("udp4");
    var c = 0;
    for (var i=0;i < 10; ++i) {
        client.send(message, 0, message.length, 9, ip, function () { ++c; if (c !== 10) return; client.close(); });
    }
}


router.get('/', function(req, res, err) {
  console.log('getting photo')

//     var settings = {
//     debug: true,
//     iface: 'WEP',
//     connectionTimeout: 10000 // in ms
//   };

//   WiFiControl.init({
//     debug: true
//   });

//   console.log('wifi init');
//   WiFiControl.configure();

// console.log('configure');
//   WiFiControl.resetWiFi( function(err, response) {
//     console.log('resetting');
//     if (err) console.log(err);
//     console.log(response);
//   } );

// WiFiControl.connectToAP( _bp, function(err, response) {
//   console.log('connecting');
//     if (err) return err;
//     console.log(response);
//   });

// Set camera mode
console.log('setting mode')



    // get last media
    cam.getMedia(lastDirectory.d, lastFile.n, lastFile.n).then(function (filename) {
        console.log(filename, '[saved]');

  //             WiFiControl.resetWiFi( function(err, response) {
  //   if (err) console.log(err);
  //   console.log(response);
  // } );

  //       WiFiControl.connectToAP( _cp, function(err, response) {
  //   if (err) console.log(err);
  //   console.log(response);
  // });
  //   });
});


});


router.post('/', function(req, res, err) {
  var photo = req.body.photo;
  console.log(photo)
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
})



module.exports = router;
