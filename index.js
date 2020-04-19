let express = require('express')
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
const port = process.env.PORT || 3000;
const colors = ['#F68C40', '#8F83F3', '#E76651', '#519BE2', '#F37298', '#7BB46C', '#265CD4', '#02B9A0', '#F80000', '#2F3035'];
let userList = [];
const aliveSeconds = 15;

const updateUsers = () => {
    let now = new Date().getTime();
    userList = userList.filter(u => ((now - u.ts) / 1000) < aliveSeconds);
}

io.on('connection', (socket) => {
    socket.on('new-user', (user) => {
        console.log('new user: ' + user);
        userList.push({ 'username': user, ts: new Date().getTime(), color: colors[Math.floor(Math.random() * colors.length-1)] })
        io.sockets.emit('update-users', userList);
    });
    socket.on('new-message', (message) => {
        console.log('message: ' + message.message);
        io.sockets.emit('new-message', message);
    });
    socket.on('user-leave', (user) => {
        console.log('user ' + user + ' leave');
        userList = userList.filter(u => u.username !== user);
        io.sockets.emit('update-users', userList);
    });
    socket.on('ping-user', (user) => {
        if (userList.length) {
            userList.map((u, i) => u.ts = u.username === user ? new Date().getTime() : u.ts);
            updateUsers();
            io.sockets.emit('update-users', userList);
        }

    });
})

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

