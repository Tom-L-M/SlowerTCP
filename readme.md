# SlowerTCP

SlowerTCP is a small tcp framework, it simplifies a little the data handling. 
It is the TCP equivalent of the Slower package.


Example usage:
```
const SlowerTCP = require('slowertcp');
const app = SlowerTCP();

app.setOnConnection((socket) => {
    console.log(`CONNECTED`);
    socket.write('DATA TO SEND ON NEW DEVICE CONNECTED');
    console.log(`SENT DATA`);
});

app.setOnData((socket, data) => {
    console.log(`RECEIVED DATA`);
    socket.write(content);
    console.log(`SENT DATA`);
});

app.setOnError((socket, err) => {
    console.log(`DESTROYED`);
});

app.setOnTimeout((socket) => {
    console.log(`TIMEOUT`);
    socket.end();
});

app.setOnEnd((socket) => {
    console.log(`DISCONNECTED`);
});
```