# SlowerTCP

SlowerTCP is a small tcp framework, it simplifies a little the data handling on tcp servers. 
It is the TCP equivalent of the Slower package.

## Usage:

```
const SlowerTCP = require('slowertcp');
const app = SlowerTCP();
```

### API Methods:

```
app.setTimeout([x=10000]): this

> Sets the number of milisseconds of socket inactivity to trigger a 
  'timeout' event.
> Returns the own object instance, so that methods can be chained.
```
```
app.setMiddleware(callback: (socket, data)): this

> Sets a callback that will be executed before every 'data' event.
> The own TCP socket, and the received data, are passed as arguments
  in the callback.
> Returns the own object instance, so that methods can be chained.
```
```
app.onConnection(callback: (socket, data)): this

> Sets a callback that will be called on 'connection' event.
> The own TCP socket is passed as argument in the callback.
> Returns the own object instance, so that methods can be chained.
```
```
app.onFallback(callback: (socket, data)): this

> Sets a callback that will be called on 'data' events that were 
  not handled by any declared routes.
> The own TCP socket, and the received data, are passed as 
  arguments in the callback.
> Returns the own object instance, so that methods can be chained.
```
```
app.onTimeout(callback: (socket)): this

> Sets a callback that will be called on 'timeout' event.
> The own TCP socket is passed as argument in the callback.
> Returns the own object instance, so that methods can be chained.
```
```
app.onEnd(callback: (socket)): this

> Sets a callback for the socket event 'end'.
> The own TCP socket is passed as argument in the callback.
> Returns the own object instance, so that methods can be chained.
```
```
app.onError(callback: (socket, errorMessage)): this

> Sets a callback that will be called on 'error' event.
> The own TCP socket, and the error message, are passed as 
  arguments in the callback.
> Returns the own object instance, so that methods can be chained.
```
```
app.setRoute(route, callback: (socket, data)): this

> Sets a callback that will be called on 'data' events that 
  matches the specified route.
> The route string supports wildcard characters: '{?}' for 
  replacing one character, or '{*}' for replacing any number 
  of characters.
> The own TCP socket, and the received data, are passed as 
  arguments in the callback.
> Returns the own object instance, so that methods can be chained.
```
```
app.start(port=8080, host='127.0.0.1', callback: ()): this

> Sets a callback that will be called when the server is started.
> Defines the port and host to start the server.
> Returns the own object instance, so that methods can be chained.
```

### API Properties

```
app.routes
> An Array containing Route instances, representing all the 
  declared routes.
> Route objects have this structure:
    Route {
        route: String
        callback: Function
    }
```
```
app.routes: Array[Route...]
app.server: net.Server
app.connectionListener: Function
app.endListener: Function
app.fallbackListener: Function
app.middlewareListener: Function
app.timeoutListener: Function
app.errorListener: Function
app.timeout: Number
app.port: Number
app.host: String
```

### API modifications on 'net.Socket' instances:
 - The API modifies every ```net.Socket``` instance BEFORE it is passed 
to ```app.connectionListener```. This means that all events receiving 
a socket will receive the modified socket instead.
 - The modifications adds the following properties to the socket instance:
```
 <socket>.session: Object           => A container for persistent data appended to sockets
 <socket>.session.port: Number      => The local port number
 <socket>.session.rport: Number     => The remote port number
 <socket>.session.host: String      => The local host interface address
 <socket>.session.rhost: String     => The remote host interface address
```
- It is possible to use the ```socket.session``` object to append data that will persist 
during the lifetime of a single connection. Useful for keeping short-life local variables.

### Example usage:
```
// Declare and initialize the module
const SlowerTCP = require('slowertcp');
const app = SlowerTCP();

// Define an optional timeout for the server
app.setTimeout(10000);

// Configure a listener for 'connection' event
app.onConnection((socket) => {
    console.log(`NEW DEVICE CONNECTED`);
    socket.write('DATA TO SEND ON NEW DEVICE CONNECTED');
    // Example for counting number of packets from a device
    socket._session.packetCount = 0; 
});

// Configure a middleware. This is called for every 'data' event,
//  and is triggered before other data handling methods 
//  (as 'setRoute' and 'setFallback')
// This is useful for configuring session-only variables, 
//  appended directly over 'socket._session',
//  or for using global event loggers.
app.setMiddleware((socket, data) => {
    socket._session.packetCount++;
    logEvent('received some data');
});

// Configure a specific route:
// Useful for well-defined protocol ASCII commands, such as in TFTP.
// Wildcards '{*}' and '{?}' are available.
app.setRoute('USER {*} .', (socket, data) => {
    // Handles any data packet starting with "USER ", 
    //  and ending with ' .'
    console.log("Submitted a username");
    socket.write('...');
});

// Example of useful route:
// Handles all data packets, as long as they are not empty
app.setRoute('{?}{*}', (socket, data) => {
    console.log("Submitted a packet with length 1 or more");
});

// Declaring the fallback route:
// All packets that are not handled by any declared route, falls here.
app.onFallback((socket, data) => {
    socket.write('This packet does not correspond to a valis command');
});

// Error handling
app.onError((socket, err) => {
    console.log(`DESTROYED`);
});

// For timeout handling.
// (Note: Not defining a timeout for server with 'setTimeout' does 
//  not prevent actual timeouts, so declare this if possible)
app.onTimeout((socket) => {
    console.log(`TIMEOUT`);
    socket.end();
});

// Triggered when a socket ends properly.
// For multiple non-standard TCP generic clients (netcat for example), 
//  this event is not triggered for disconnection, 
//  instead, the client forcefully closes the connection, 
//  triggering an 'Error' event.
app.onEnd((socket) => {
    console.log(`DISCONNECTED`);
});
```