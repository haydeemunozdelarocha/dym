var express = require('express');
var GoPro = require('../lib/index.js');
var router = express.Router();
var WiFiControl = require('wifi-control');
var request =   require('request');

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

router.use(function (req, res, next) {
  console.log('setting headers')
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://evening-bastion-81870.herokuapp.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

router.get('/', function(req, res, err) {
  console.log('getting photo')

  //   var settings = {
  //   debug: true,
  //   iface: 'WEP',
  //   connectionTimeout: 10000 // in ms
  // };

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
cam.mode(GoPro.Settings.Modes.Photo, GoPro.Settings.Submodes.Photo.Single)

// Set photo resolution
.then(function () {
    return cam.set(GoPro.Settings.PHOTO_RESOLUTION, GoPro.Settings.PhotoResolution.R5MP)
})
// // Take picture
.then(function () {
  console.log('cam starting')
    return cam.start()
})

// // Done
.then(function () {
    console.log('[picture taken]')
    return cam.stop()
})

        // var url = 'http://10.5.5.9/gp/gpControl/command/shutter?p=0';

        // request.get(url, function (error, response, body) {
        //   console.log('starting get request')
        //     if (!error && response.statusCode == 200) {
        //       console.log('no error');
        //     } else {
        //       console.log(error)
        //     }
        // });

// list media
cam.listMedia().then(function (result) {
  console.log('listing media')
    var lastDirectory = result.media[result.media.length - 1];
    var lastFile = lastDirectory.fs[lastDirectory.fs.length - 1];

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
})

module.exports = router;
