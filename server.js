var net = require('net');
var PORT = 4242;
var openConnections = [];
var vrConnected = false;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(socket) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    // Create a connection object to keep track of connections
    var connection = {
        ip: socket.remoteAddress,
        role: "none",
        com: socket
    }

    // Add the connection to a queue of connections
    openConnections.push(connection);
    
    // Add a 'data' event handler to this instance of socket
    socket.on('data', function(data) {

        //console.log(socket)
        
        console.log("Recieved communication from " + socket.remoteAddress + "--" + data) ;
        // Find the socket which just sent the message
        socketIndex = returnConnectionSocket(socket) ;
        if(socketIndex == -1)
        {
            console.log("This connection is not known") ;
        }
        else
        {
            // Check if this connection has a role
            if(openConnections[socketIndex].role == "none")
            {
                console.log('This is a new device');
                AssignRole(data.toString()) ;
            }
            // It already has
            else
            {
                IncomingData(socketIndex,data.toString()) ;
            }
        }
    });
    
    // Add a 'close' event handler to this instance of socket
    socket.on('close', function(data) {

        console.log("Attempting to close the the socket")

        socketIndex = returnConnectionSocket(socket) ;
        
        if(socketIndex == -1)
        {
            console.log("Socket closing failure");
        }
        else
        {
            if(openConnections[socketIndex].role == "vr")
            {
                vrConnected = false;
            }
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

function returnConnectionSocket(theSocket) 
{
    for (var i = 0; i < openConnections.length; i++) 
    {
        console.log("here")
        if(theSocket == openConnections[i].com)
        {
            return i;
        }
    }
    return -1;
}

function returnConnectionIndexFromRole(theRole) 
{
    for (var i = 0; i < openConnections.length; i++) 
    {
        if(theRole == openConnections[i].role)
        {
            return i;
        }
    }
    return -1;
}

function AssignRole(in_data) 
{
    switch (String(in_data).substring(0, 2)) {
        case 'co':
            console.log('The device is requesting to be a controller');
            //TODO check if there are any other controllers
            console.log('controller accepted');
            openConnections[socketIndex].role = "controller";   
            openConnections[socketIndex].com.write('ack');
            break;
        case 'we':
            console.log('The device is requesting to be a website');
            //TODO check if there are any other controllers
            console.log('web accepted');
            openConnections[socketIndex].role = "web";   
            openConnections[socketIndex].com.write('ack');
            break;
        case 'vr':
            console.log('The device is requesting to be virtual reality');
            //TODO check if there are any other controllers
            console.log('vr accepted');
            openConnections[socketIndex].role = "vr";  
            openConnections[socketIndex].com.write('ack'); 
            vrConnected = true;
            break;
        default:
            console.log('Not a known request');
            openConnections[socketIndex].com.write('rej');
    }
}

function IncomingData(theSocketIndex, in_data) 
{
    switch (openConnections[theSocketIndex].role) {
        case 'controller':
                console.log("Controller spoke to me") ;
            break;
        case 'web':
                if(vrConnected == true)
                {
                    console.log("There is a vr machine connected, cant forward web message")
                }
                else
                {
                    var controllerIndex = returnConnectionIndexFromRole("controller") ;
                    if(controllerIndex == -1)
                    {
                        console.log("Error could not find controller") ;
                    }
                    else
                    {
                        console.log("Replying");
                        openConnections[controllerIndex].com.write(in_data) ;
                    }
                }
            break;
        case 'vr':
                var controllerIndex = returnConnectionIndexFromRole("controller") ;
                if(controllerIndex == -1)
                {
                    console.log("Error could not find controller") ;
                }
                else
                {
                    console.log("Forwarding message to controller");
                    openConnections[controllerIndex].com.write(in_data) ;
                }
            break;
        default:
            console.log('Not a known request');
            openConnections[socketIndex].com.write('rej');
    }
}