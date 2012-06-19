// a trivial process that does nothing except
// trigger GC and output the present base memory
// usage every second.  this example is intended to
// demonstrate that gcstats itself does not leak.

var http = require('http');

var start = new Date();
function msFromStart() {
  return new Date() - start;
}

var gcstats = require('../');

var leak = [];

// every second, this program "leaks" a little bit
setInterval(function() {
  for (var i = 0; i < 10; i++) {
    var str = i.toString() + " on a stick, short and stout!";
    leak.push(str);
  }
}, 1000);

// meantime, the program is busy, doing *lots* of http requests
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

function doHTTPRequest() {
  var options = {
    host: '127.0.0.1',
    port: 1337,
    path: '/index.html'
  };

  http.get(options, function(res) {
    setTimeout(doHTTPRequest, 300);
  }).on('error', function(e) {
    setTimeout(doHTTPRequest, 300);
  });
}

doHTTPRequest();
doHTTPRequest();

// report to console postgc heap size
gcstats.on('gc', function(d) {
  if (d.compacted) {
    console.log("postgc:", msFromStart(), gcstats.stats().current_base);
  }
});

// also report periodic heap size (every 10s)
setInterval(function() {
  console.log("naive:", msFromStart(), process.memoryUsage().heapUsed);
}, 10000);