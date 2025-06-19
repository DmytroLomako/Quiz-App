const quizCode = document.getElementById('test-code').textContent
const socketUrl = `ws://${window.location.host}/ws/quiz/${quizCode}/`
let usersDiv = document.querySelector('.users')
let startTest = document.getElementById('startTest')

const socket = new WebSocket(socketUrl)

let lastQuestion = document.querySelector('#lastQuestion').value == 'True'
console.log(lastQuestion)

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
    } else if(data['type'] == 'admin_user_answer'){
        console.log('')
        if (data['not_answer_count'] == 0){
            toggleStopQuestion(document.querySelector('.stop-question-button'))
        }
        let username = data['username']
        let users = usersDiv.querySelectorAll('b')
        users.forEach(user => {
            if(user.textContent == username){
                user.parentElement.classList.add('answered')
            }
        })
    } else if(data['type'] == 'get_question'){
        let usernames = usersDiv.querySelectorAll('b')
        usernames.forEach(user => {
            user.parentElement.classList.remove('answered')
        })
        if (data['last_question']){
            lastQuestion = true
        }
        $.ajax({
            url: '/tests/get_question',
            type: 'POST',
            data: {
                'csrfmiddlewaretoken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                'test_id': data['test_id'],
                'question_number': data['question_number']
            },
            success: function(response){
                console.log(response)
                let data = response.question
                let questionDiv = document.querySelector('.question-block')
                if (questionDiv) {
                    questionDiv.remove()
                }
                questionDiv = document.createElement('div')
                questionDiv.classList.add('question-block')
                questionDiv.innerHTML = `<h2>${data['question']}</h2>`
                document.body.append(questionDiv)
                if ( data.answer_type == 'multiple_choice' ){
                    let answers = JSON.parse(data['answers'].replace(/'/g, '"'))
                    answers.forEach(function(answer, index){
                        questionDiv.innerHTML += `<div class='answer'>${answer}</div>`
                    })
                }
            }
        })
    } else if(data['type'] == 'stop_test'){
        window.location.href = `/results/view_result/${data['id_admin']}`
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

function toggleStopQuestion(button, send=true){
    button.remove()
    let nextButton = document.createElement('button')
    if (lastQuestion){
        nextButton.textContent = 'Завершити тест'
        nextButton.classList.add('stop-test-button')
        nextButton.addEventListener('click', sendStop)
    } else {
        nextButton.textContent = 'Наступне питання'
        nextButton.classList.add('next-question-button')
        nextButton.addEventListener('click', () => {sendNext(nextButton)})
    }
    document.body.append(nextButton)
    if (send){
        socket.send(JSON.stringify({
            'type': 'stop_question'
        }))
    }
}

function sendStop(){
    socket.send(JSON.stringify({
        'type': 'stop_test'
    }))
}

startTest.addEventListener('click', () => {
    socket.send(JSON.stringify({
        'type': 'start_test'
    }))
    let buttonStop = document.createElement('button')
    buttonStop.textContent = 'Зупинити питання'
    buttonStop.classList.add('stop-question-button')
    document.body.append(buttonStop)
    buttonStop.addEventListener('click', () => {toggleStopQuestion(buttonStop)})
})

let buttonStop = document.querySelector('.stop-question-button')
if (buttonStop) {
    buttonStop.addEventListener('click', () => {toggleStopQuestion(buttonStop)})
}

let buttonNext = document.querySelector('.next-question-button')
function sendNext(nextButton){
    nextButton.remove()
    let buttonStop = document.createElement('button')
    buttonStop.textContent = 'Зупинити питання'
    buttonStop.classList.add('stop-question-button')
    document.body.append(buttonStop)
    buttonStop.addEventListener('click', () => {toggleStopQuestion(buttonStop)})
    socket.send(JSON.stringify({
        'type': 'next_question'
    }))
}
if (buttonNext){
    buttonNext.addEventListener('click', () => {sendNext(buttonNext)})
}

let buttonStopTest = document.querySelector('.stop-test-button')
if (buttonStopTest){
    buttonStopTest.addEventListener('click', sendStop)
}