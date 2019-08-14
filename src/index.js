const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {getMessages , generateLocationMessage } = require('./utils/messages')
const { addUser , removeUser , getUser , getUsersinRoom } = require('./utils/users')

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPath = path.join(__dirname,'../public')

app.use(express.static(publicPath))

io.on('connection', (socket) =>{
    console.log('New Websocket Connection')

    socket.on('join' ,({ username , room} , callback) =>{
        
        const {error , user } = addUser({ id: socket.id ,username, room})
        if(error)
        {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('print' , getMessages('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('print' , getMessages('Admin',   user.username +' has joined!'))
        io.to(user.room).emit('roomData' , {
            room:user.room,
            users:getUsersinRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage' , (msg , callback) =>{
    
        const user = getUser(socket.id)
        if(user)
        {
        const filter = new Filter

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('print' , getMessages(user.username, msg))
        callback()
    }
    })
    
    socket.on('sendLocation' , (location , callback)=>{

        const user = getUser(socket.id)
        if(user)
        {

        const address = 'https://google.com/maps?q=' + location.lat +',' + location.long 
        io.to(user.room).emit('locationPrint', generateLocationMessage(user.username , address))
        callback()

        }
    })
    socket.on('disconnect' ,() =>{
        const user = removeUser(socket.id)
        
        if(user){
        io.to(user.room).emit('print' , getMessages('Admin' , user.username + ' has left!'))
        io.to(user.room).emit('roomData' , {
            room:user.room,
            users:getUsersinRoom(user.room)
        })
        }
    })
})

server.listen(port, () => {
    console.log('The server is running on ' + port)
})