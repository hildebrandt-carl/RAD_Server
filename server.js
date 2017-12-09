var net = require('net');
var PORT = 4242;
var openConnections = [];
var vrConnected = false;

var TotalMessages = 0;
var startupTime = new Date();

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
        
        console.log("Recieved communication from " + socket.remoteAddress + "--" + data) ;
        
        // Keep track of total messages
        TotalMessages = TotalMessages + 1;
        console.log("Message number: " + TotalMessages);

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

                // Loop through the openConnections and send how many people are currently connected to the webserver
                webIndex = returnConnectionIndexFromRole("web") ;
                if(webIndex != -1)
                {
                    console.log("Sending the connection status's to the website");
                    openConnections[webIndex].com.write("web1") ;
                    if(returnConnectionIndexFromRole("vr") == -1)
                    {
                        openConnections[webIndex].com.write("vrb0") ;
                    }
                    else
                    {
                        openConnections[webIndex].com.write("vrb1") ;
                    }
                    if(returnConnectionIndexFromRole("controller") == -11)
                    {
                        openConnections[webIndex].com.write("con0") ;
                    }
                    else
                    {
                        openConnections[webIndex].com.write("con1") ;
                    }
                }
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
            console.log('Connection closed: ' + socket.remoteAddress);
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
                console.log("Controller sent a message") ;
            break;
        case 'web':
                if(vrConnected == true)
                {
                    console.log("There is a vr machine connected, cant forward web message")
                }
                else
                {
                    console.log("Data received from the website");
                    var controllerIndex = returnConnectionIndexFromRole("controller") ;
                    if(controllerIndex == -1)
                    {
                        console.log("Error could not find controller") ;
                    }
                    else
                    {
                        console.log("Forwarding packet to controller");
                        openConnections[controllerIndex].com.write(in_data) ;
                    }
                    console.log("Returning how many messages have been sent") ;
                    openConnections[theSocketIndex].com.write(TotalMessages.toString()) ;
                    //currentTime = new Date();
                    //currentTime = currentTime - startupTime ;
                    //console.log("Current Up Time:" + currentTime.toString() )
                    openConnections[theSocketIndex].com.write()
                }
            break;
        case 'vr':
                console.log("Data received from the vr system");
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
