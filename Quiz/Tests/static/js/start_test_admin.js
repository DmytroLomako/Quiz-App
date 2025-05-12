const quizCode = document.getElementById('test_code').textContent
const socketUrl = `ws://${window.location.host}/ws/quiz/${quizCode}/`
let usersDiv = document.querySelector('.users')

const socket = new WebSocket(socketUrl)

socket.onmessage = function(event){
    let data = JSON.parse(event.data)
    console.log('received', data)
    if(data['type'] == 'user_connect'){
        let username = data['username']
        if(Array.isArray(username)){
            username = username[0]
        }
        usersDiv.innerHTML += `<p>${username}</p>`
    } else if(data['type'] == 'user_disconnect'){
        let username = data['username']
        let users = usersDiv.querySelectorAll('p')
        users.forEach(user => {
            if(user.textContent == username){
                user.remove()
            }
        })
    }
}