/*var http = require("http");

http.createServer(function (request, response) {

request.on("end", function () {
    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });

    response.end('Hello HTTP!');
});

    response.end('Seconds HTTP!');
}).listen(4242);*/

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

/*
// server
require('net').createServer(function (socket) {
    console.log("connected");

    socket.on('data', function (data) {
        console.log(data.toString());
    });
})

.listen(4242);*/

var net = require('net');

var PORT = 4242;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(socket) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('-------------------------');
    console.log('CONNECTED: ' + '\t' + socket.remoteAddress +':'+ socket.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    socket.on('data', function(data) {
        
        console.log('Incoming data from: ' + '\t' + socket.remoteAddress + ':'+ socket.remotePort);
        console.log('The data was: ' + '\t' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        console.log('Responding to: ' + '\t' + socket.remoteAddress + ':'+ socket.remotePort);
        socket.write('You said "' + data + '"');
        
    });
    
    // Add a 'close' event handler to this instance of socket
    socket.on('close', function(data) {
        console.log('CLOSED: ' + '\t' + socket.remoteAddress +' '+ socket.remotePort);
        console.log('-------------------------');
    });


    // If there is an error event
    socket.on("error", function(err) {
        console.log("There was an error")
        console.log(err.stack)
    });
    
}).listen(PORT)

console.log('Server listening on port: ' + PORT);