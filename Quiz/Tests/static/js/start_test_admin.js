const quizCode = document.getElementById('test_code').textContent
const socketUrl = `ws://${window.location.host}/ws/quiz/${quizCode}/`
let usersDiv = document.querySelector('.users')
let startTest = document.getElementById('startTest')

const socket = new WebSocket(socketUrl)

socket.onmessage = function(event){
    let data = JSON.parse(event.data)
    console.log('received', data)
    if(data['type'] == 'user_connect'){
        let userId = data['id']
        let username = data['username']
        if(Array.isArray(username)){
            username = username[0]
        }
        let user = document.createElement('p')
        user.innerHTML += `<input type="hidden" class="userId" value="${userId}"> <b>${username}</b> <button class="delete-user">×</button>`
        let buttonDelete = user.querySelector('.delete-user')
        buttonDelete.addEventListener('click', deleteUser)
        usersDiv.append(user)
    } else if(data['type'] == 'user_disconnect' && data['receiver'] == 'admin'){
        let username = data['username']
        let users = usersDiv.querySelectorAll('b')
        users.forEach(user => {
            if(user.textContent == username){
                user.parentElement.remove()
            }
        })
    }
}

let buttonsDelete = document.querySelectorAll('.delete-user')
buttonsDelete.forEach(button => {
    button.addEventListener('click', deleteUser)
})
function deleteUser (event){
    let username = event.target.previousElementSibling.textContent
    let userId = event.target.parentElement.querySelector('.userId')
    if (userId){
        userId = userId.value
    }
    socket.send(JSON.stringify({
        'type': 'admin_user_disconnect',
        'username': username,
        'user_id': userId
    }))
    event.target.parentElement.remove()
}

startTest.addEventListener('click', () => {
    socket.send(JSON.stringify({
        'type': 'start_test'
    }))
})