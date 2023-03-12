const net = require('net');
const noop = () => {};

class SlowerTCPRouter {
    constructor () { 
        this.server = noop;
        this.onConnection = noop;
        this.onEnd = noop;
        this.onData = noop;
        this.onTimeout = noop;
        this.onError = noop;
        this.port;
    }
    setOnEnd(callback) { return this.onEnd = (typeof callback == 'function' ? callback : noop); }
    setOnData(callback) { return this.onData = (typeof callback == 'function' ? callback : noop); }
    setOnTimeout(callback) { return this.onTimeout = (typeof callback == 'function' ? callback : noop); }
    setOnError(callback) { return this.onError = (typeof callback == 'function' ? callback : noop); }
    setOnConnection(callback) { return this.onConnection = (typeof callback == 'function' ? callback : noop); }
    start (port = 8081, callback = noop) {
        let onConnection = this.onConnection;
        let onEnd = this.onEnd;
        let onData = this.onData;
        let onTimeout = this.onTimeout;
        let onError = this.onError;
        this.port = port;
        this.server = net.createServer(function (socket) {
            onConnection(socket);
            socket.on('end', function () { onEnd(socket); });
            socket.on('data', function (data) { onData(socket, data); });
            socket.on('timeout', function () { onTimeout(socket); });
            socket.on('error', function (err) { onError(socket,err); });
        });
        this.listener = this.server.listen(port, callback);
    }
}

const SlowerTCP = () => { return new SlowerTCPRouter(); }

module.exports = SlowerTCP;