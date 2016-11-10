var express = require('express');
var router = express.Router();
var request =   require('request');
var fs = require('fs');
var moment= require('moment');
var S3FS = require('s3fs');


var s3Options = {
  accessKeyId: 'AKIAJ4J7HSAEOUH3YHLA',
  secretAccessKey: '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'
};

var fsImpl = new S3FS('dymingenieros', s3Options);

router.get('/', function(req, res, err) {
  console.log('getting photo')
  // if (req.user.accessToken){
  var auth_token = req.user.accessToken;
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
// } else {
//   res.redirect('./auth/nest/')
// }
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    photo = body;
    var date= Date.now();
    var hora = moment(date).format("DD-MM-YYYY-hh-mm");
    var path =''+hora+'.jpg';
           fsImpl.writeFile(path, body, function(err){
            if (err) throw err
              res.send('https://s3.amazonaws.com/dymingenieros/'+path)
            console.log('File saved.')
        })

  }
}

request(options, callback);
});

module.exports = router;
