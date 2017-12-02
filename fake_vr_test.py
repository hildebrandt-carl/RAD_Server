import socket
import time

ipAddress = '160.119.248.28'

portNumber = 4242

print("Starting RAD_Team's web connection")
print("Attempting to connect to: %s:%d" % (ipAddress, portNumber))

sock = socket.socket()

try:
    sock.connect((ipAddress, portNumber))
except:
    print("Connection failure")
    exit(0)

print("Connection success")
print("Telling the server that its the web connecting")
sock.send("vr")

print("Waiting for a responce")
return_string = sock.recv(256)

if(return_string == "ack"):
    print("Controller accepted")
else:
    print("Controller rejected")
    exit(0)


print("Sending two messages to the server")
sock.send("First Message from VR")
sock.send("Seccond Message from VR")

time.sleep(3)

sock.send("Third Message from VR")

while(1):
    time.sleep(3)
    sock.send("Loop Message from VR")

print("Closing connection")
sock.close()