process.env.TMPDIR = 'tmp'; // to avoid the EXDEV rename error, see http://stackoverflow.com/q/21071303/76173
var UPLOAD_DIR = 'uploads/';

var express = require('express');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var flow = require('./flow-node.js')('tmp');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var app = express();

// Configure access control allow origin header stuff
var ACCESS_CONTROLL_ALLOW_ORIGIN = false;

// Host most stuff in the public folder
app.use(express.static(__dirname + '/../prototype'));
app.use(express.static(__dirname + '/uploads'));

var getHashFromFile = function(filepath, filename, callback) {
  var completePath = filepath + filename;
  // Read the file again and create a hash for it
  var shasum = crypto.createHash('sha256');
  var reader = fs.ReadStream(completePath);
  reader.on('data', function(hash) {
    shasum.update(hash);
  });

  reader.on('end', function() {
    var hash = shasum.digest('hex');
    // console.log(d + '  ' + filename);
    callback(hash);
  });
}

// The flow logic is adapted from the flow.js Github Repo.
// See `flow.js/samples/Node.js/README.md` for more details!
// Handle uploads through Flow.js
app.post('/upload', multipartMiddleware, function(req, res) {
  flow.post(req, function(status, filename, original_filename, identifier) {
    console.log('POST', status, original_filename, identifier);
    // Now we have to write the file from the file chunks!
    // Took the code from here: https://github.com/flowjs/flow.js/issues/17#issuecomment-49737531
    // console.log(status);
    if (status == 'done') {
      var filepath = UPLOAD_DIR + filename;
      var stream = fs.createWriteStream(filepath);
      flow.write(identifier, stream);

      getHashFromFile(UPLOAD_DIR, filename, function(hash){
        console.log(hash);
        var extension = path.extname(filename);
        fs.rename(UPLOAD_DIR + filename, UPLOAD_DIR + hash + extension, function(err) {
          if ( err ) console.log('ERROR: ' + err);
        });
      });
    }
    // TODO: Remove files from tmp folder after file is assembled
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header("Access-Control-Allow-Origin", "*");
    }
    res.status(status).send();
  });
});


app.options('/upload', function(req, res){
  console.log('OPTIONS');
  if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.status(200).send();
});

// Handle status checks on chunks through Flow.js
app.get('/upload', function(req, res) {
  flow.get(req, function(status, filename, original_filename, identifier) {
    console.log('GET', status);
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header("Access-Control-Allow-Origin", "*");
    }

    if (status == 'found') {
      status = 200;
    } else {
      status = 404;
    }
    res.status(status).send();
  });
});

app.get('/download/:identifier', function(req, res) {
  flow.write(req.params.identifier, res);
});

var port = 8888;
console.log("Started listening on Port " + port);
app.listen(port);