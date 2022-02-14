const express = require('express')
const path = require('path')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const PORT = 8001
const formatMessage = require('./message')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./user')

//set static
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot'

//connect
io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        //welcome single user send
        socket.emit('message', formatMessage(botName, 'Welcome To ChatCord!'))

        //broadcast user //every user send Message
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} A user has Join Chat`))

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} A user Has Left The Chat`))

            //send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

    //listen for Chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })


})

http.listen(PORT)