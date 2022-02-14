const chatform = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//get Username And Room from Url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io()


//join chatroom
socket.emit('joinRoom', { username, room })

//get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room)
    outputUsers(users)
})

//Message from server
socket.on('message', (message) => {
    outputMessage(message)

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

//Message submit
chatform.addEventListener('submit', (e) => {
    e.preventDefault()

    //get message text
    const msg = e.target.elements.msg.value

    //Emit message to server
    socket.emit('chatMessage', msg)

    //clear Input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

//output message
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span> ${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)
}

//Add room name
function outputRoomName(room) {
    roomName.innerText = room
}

//get Users
function outputUsers(users) {

    userList.innerHTML = `
            ${users.map(user => `<li>${user.username}</li>`).join('')}
        `
}