const net = require('net');

const { noop, isSparseEqual } = require('./utils');
const Route = require('./route');

class SlowerTCPRouter {
    constructor () { 
        this.server = {};
        this.connectionListener = noop;
        this.endListener = noop;
        this.fallbackListener = noop;
        this.middlewareListener = noop;
        this.timeoutListener = noop;
        this.errorListener = noop;
        this.timeout = 0;
        this.port = 0;
        this.host = '127.0.0.1';
        this.routes = [];
    }
    // Set timeout for sockets:
    setTimeout (time = 10000) { this.timeout = time; return this; }

    // For all Data events (executed before 'OnFallback' and before routes)
    setMiddleware (callback) { this.middlewareListener = (typeof callback == 'function' ? callback : noop); return this; }

    // For 'connect' event:
    onConnection (callback) { this.connectionListener = (typeof callback == 'function' ? callback : noop); return this; }
    
    // For request endings:
    onEnd (callback) { this.endListener = (typeof callback == 'function' ? callback : noop); return this; }

    // For Data events that are not handled byr Routes
    onFallback (callback) { this.fallbackListener = (typeof callback == 'function' ? callback : noop); return this; }

    // For request timeouts:
    onTimeout (callback) { this.timeoutListener = (typeof callback == 'function' ? callback : noop); return this; }

    // For request errors:
    onError (callback) { this.errorListener = (typeof callback == 'function' ? callback : noop); return this; }

    // For 'data' events that match the route pattern: 
    setRoute (route, callback) { this.routes.push(new Route(route, callback)); return this; }

    start (port = 8080, host = '127.0.0.1', callback = noop) {
        let onConnection = this.connectionListener;
        let onEnd = this.endListener;
        let onFallback = this.fallbackListener;
        let onTimeout = this.timeoutListener;
        let onError = this.errorListener;
        let onMiddleware = this.middlewareListener;
        let timeout = this.timeout;
        let routes = this.routes;
        this.port = port;
        this.host = host;
        this.server = net.createServer(function (socket) {
            onConnection(socket);
            if (timeout) socket.setTimeout(timeout);
            socket.on('data', function (buffer) {
                let data = buffer.toString();
                onMiddleware(socket, data);
                for (let i = 0; i < routes.length; i++) {
                    if (isSparseEqual(routes[i].route, data)) {
                        routes[i].callback(socket, data);
                        return;
                    }
                }
                onFallback(socket, data);
            });
            socket.on('end', function () { onEnd(socket); });
            socket.on('timeout', function () { onTimeout(socket); });
            socket.on('error', function (err) { onError(socket,err); });
        });
        this.server.listen(port, host, callback);
        return this;
    }
}

const SlowerTCP = () => { return new SlowerTCPRouter(); }

module.exports = SlowerTCP;