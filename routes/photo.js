var express = require('express');
var router = express.Router();
var request =   require('request');
var fs = require('fs');
var moment= require('moment');
var S3FS = require('s3fs');
var session = require('express-session');

var fsImpl = new S3FS('dymingenieros', {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

router.post('/', function(req, res, err) {
//   console.log('getting photo')
//   // if (req.user.accessToken){
//   var auth_token = req.user.accessToken;
//   console.log(auth_token)
//   var url='https://www.dropcam.com/api/wwn.get_snapshot/CjZrVXNJUjJ4cWhHT0UxcVNGbVR3dm9odDZYZllsNVhnMkQyRnozNmFoV0V4VDBuZjNhUUIyalESFkFMbS1GV2JXVUNwTFlINi1hcGNYckEaNkF3TnM5cXlKamxERVYwdVhnLUM2b3J6cDg3ZGNfV05mM1BYVXRRTm1GRGF1eGhJR1JVY3J3UQ?auth='+auth_token;
//   var photo;
//   console.log(url)
//   var options = {
//   url: url,
//   encoding: 'binary',
//   headers: {
//     'Authorization': 'Bearer '+ auth_token,
//     'Content-Type': 'application/x-www-form-urlencoded'
//   }
// };

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

request(options, callback);

});

module.exports = router;
