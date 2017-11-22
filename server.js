var net = require('net');
var PORT = 4242;
var openConnections = [];

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(socket) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + '\t\t' + socket.remoteAddresss);
    // Create a connection object to keep track of connections
    var connection = {
        ip: socket.remoteAddress,
        role: "none"
    }

    // Add the connection to a queue of connections
    openConnections.push(connection);
    
    // Add a 'data' event handler to this instance of socket
    socket.on('data', function(data) {
        
        console.log("Recieved communication from " + socket.remoteAddress) ;
        // Find the socket which just sent the message
        socketIndex = returnConnectionIndex(socket.remoteAddress) ;
        if(socketIndex == -1)
        {
            console.log("This connection IP address is not known") ;
        }
        else
        {
            // Check if this connection has a role
            if(openConnections[socketIndex].role == "none")
            {
                console.log('This is a new device');
                switch (new Date().getDay()) {
                    case "controller":
                        console.log('The device is requesting to be a controller');
                        //TODO check if there are any other controllers
                        console.log('controller accepted');
                        socket.write('ack');
                        openConnections[socketIndex].role = "controller";   
                        break;
                    case "web":
                        console.log('The device is requesting to be a website');
                        //TODO check if there are any other controllers
                        console.log('controller accepted');
                        socket.write('ack');
                        openConnections[socketIndex].role = "web";   
                        break;
                    default:
                        console.log('Not a known request');
                        socket.write('rej');
                }
            }
        }

        console.log('-------Current Open Connections---------');
        console.log(openConnections);
        console.log('----------------------------------------');
    });
    
    // Add a 'close' event handler to this instance of socket
    socket.on('close', function(data) {

        console.log("Attempting to close the the socket")

        socketIndex = returnConnectionIndex(socket.remoteAddress) ;
        
        if(socketIndex == -1)
        {
            console.log("Socket closing failure");
        }
        else
        {
            // At position SocketIndex remove 1 item.
            openConnections.splice(socketIndex,1);
            console.log('CLOSED: ' + '\t\t' + socket.remoteAddress);
        }
        
    });

    // If there is an error event
    socket.on("error", function(err) {
        console.log("There was an error")
        console.log(err.stack)
    });

    // If there is an error event
    socket.on("end", function(data) {
        console.log("There was an end")
    });
    
}).listen(PORT)

console.log('Server listening on port: ' + PORT);

function returnConnectionIndex(theIPAddress) 
{
    for (var i = 0; i < openConnections.length; i++) 
    {
        if(theIPAddress == openConnections[i].ip)
        {
            return i;
        }
    }
    return -1;
}