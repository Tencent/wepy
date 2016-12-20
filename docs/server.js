var serveStatic = require('serve-static');
var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {
  serveStatic('.')(req, res, function () {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end(fs.readFileSync('docs/index.html'))
  })
}).listen(3030, '0.0.0.0')

console.log(`\nListening at http://0.0.0.0:3030\n`)