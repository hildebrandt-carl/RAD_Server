var http = require("http");

http.createServer(function (request, response) {

request.on("end", function () {
    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });

    response.end('Hello HTTP!');
});

    response.end('Seconds HTTP!');
}).listen(4242);


/*var http = require("http");
var server = http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write("<!DOCTYPE html>");
  response.write("<html>");
  response.write("<head>");
  response.write("<title>Hello World Page</title>");
  response.write("</head>");
  response.write("<body>");
  response.write("Hello World!");
  response.write("</body>");
  response.write("</html>");
  response.end();
});

server.listen(4242);
console.log("Server is listening");*/