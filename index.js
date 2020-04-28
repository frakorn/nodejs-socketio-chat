let express = require('express')
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
const port = process.env.PORT || 3000;
const colors = ['#F68C40', '#8F83F3', '#E76651', '#519BE2', '#F37298', '#7BB46C', '#265CD4', '#02B9A0', '#F80000', '#2F3035'];
let userList = [];
let actionObj = {};
const aliveSeconds = 15;

const updateUsers = () => {
    let now = new Date().getTime();
    userList = userList.filter(u => ((now - u.ts) / 1000) < aliveSeconds);
}

io.on('connection', (socket) => {
    /* chat */
    socket.on('new-user', (user) => {
        if(!userList.find(u =>u.username===user)){
            console.log('new user: ' + user);
            userList.push({ 'username': user, ts: new Date().getTime(), color: colors[Math.floor(Math.random() * colors.length-1)] })
            actionObj = {'action':'new-user','username':user,'userList':userList};
            io.sockets.emit('update-users', actionObj);
        }
        else{
            io.sockets.emit('username-error', user);
        }

    });
    socket.on('new-message', (message) => {
        console.log('message: ' + message.message);
        io.sockets.emit('new-message', message);
    });
    socket.on('user-leave', (user) => {
        console.log('user ' + user + ' leave');
        userList = userList.filter(u => u.username !== user);
        actionObj = {'action':'user-leave','username':user,'userList':userList};
        io.sockets.emit('update-users', actionObj);
    });
    socket.on('ping-user', (user) => {
        if (userList.length) {
            userList.map((u, i) => u.ts = u.username === user ? new Date().getTime() : u.ts);
            updateUsers(user);
            actionObj = {'action':'ping','username':user,'userList':userList};
            io.sockets.emit('update-users', actionObj);
        }
    });
    /* draw */
    socket.on('update-draw', (drawObj) => {
        console.log(`update draw username:${drawObj.username}`)
        io.sockets.emit('update-draw', drawObj);
    });
    socket.on('create-draw', (drawObj) => {
        console.log(`create draw username:${drawObj.username} type:${drawObj.type} id:${drawObj.draw.target.id} `)
        io.sockets.emit('create-draw', drawObj);
    });   
    socket.on('remove-draw', (drawObj) => {
        console.log(`remove draw username:${drawObj.username}`)
        io.sockets.emit('remove-draw', drawObj);
    });      
})

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

