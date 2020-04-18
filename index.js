let express = require('express')
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('new-user', (user) => {
        console.log('new user: ' + user);
        io.sockets.emit('new-user', user);
    });
    socket.on('new-message', (message) => {
        console.log('message: '+message.message);
        io.sockets.emit('new-message', message);
    });
    socket.on('user-leave', (user) => {
        console.log('user ' + user + ' leave');
        io.sockets.emit('user-leave', user);
    });    
})

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});