const quizCode = document.getElementById('test-code').textContent
const socketUrl = `ws://${window.location.host}/ws/quiz/${quizCode}/`
let usersDiv = document.querySelector('.users')
let startTest = document.getElementById('startTest')
let startTestButtonDiv = document.querySelector('.start-test-button-div')
let head = document.querySelector('.head')
let countUsers = document.querySelector('.users-info').querySelector('h1')

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
        user.innerHTML += `<input type="hidden" class="userId" value="${userId}"> <img src="/static/img/avatar.png" alt=""> <b>${username}</b> <button class="delete-user" style="display: none;"><img src="/static/CreateTest/img/trash.png" alt=""></button>`
        let buttonDelete = user.querySelector('.delete-user')
        buttonDelete.addEventListener('click', deleteUser)
        usersDiv.append(user)
        let count_users = usersDiv.querySelectorAll('b').length
        if (count_users == 1){
            count_users = '1 учасник'
        }else if ('234'.includes(String(count_users)[String(count_users).length - 1]) && (String(count_users).length == 1 || String(count_users)[String(count_users).length - 2] != '1')){
            count_users = count_users + ' учасники'
        }
        else{
            count_users = count_users + ' учасників'
        }
        countUsers.textContent = count_users
        deleteUserHover()
    } else if(data['type'] == 'user_disconnect' ){

        if (data['receiver'] == 'admin'){
            let username = data['username']
            let users = usersDiv.querySelectorAll('b')
            users.forEach(user => {
                if(user.textContent == username){
                    user.parentElement.remove()
                }
            })
        }
        let count_users = usersDiv.querySelectorAll('b').length
        if (count_users == 1){
            count_users = count_users + ' учасник'
        } else if ('234'.includes(String(count_users)[String(count_users).length - 1]) && (String(count_users).length == 1 || String(count_users)[String(count_users).length - 2] != '1')){
            count_users = count_users + ' учасники'
        }
        else{
            count_users = count_users + ' учасників'
        }
        countUsers.textContent = count_users
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
                if (data.question_number == 0){
                    head.innerHTML = `<h1 style="display: none;" id="test-code">${ quizCode }</h1>`
                }
                let questionDiv = document.querySelector('.question-div')
                if (questionDiv) {
                    questionDiv.remove()
                }
                questionDiv = document.createElement('div')
                questionDiv.classList.add('question-div')
                let question = document.createElement('div')
                question.classList.add('question')
                question.textContent = data['question']
                questionDiv.append(question)
                let answersDiv = document.createElement('div')
                answersDiv.classList.add('answers')
                if ( data.answer_type == 'multiple_choice' ){
                    let answers = JSON.parse(data['answers'].replace(/'/g, '"'))
                    answers.forEach(function(answer, index){
                        answersDiv.innerHTML += `<div class="answer">${ answer }</div>`
                    })
                }
                questionDiv.appendChild(answersDiv)
                head.appendChild(questionDiv)
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
    startTestButtonDiv.append(nextButton)
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

if (startTest) {
    startTest.addEventListener('click', () => {
        socket.send(JSON.stringify({
            'type': 'start_test'
        }))
        startTest.remove()
        let buttonStop = document.createElement('button')
        buttonStop.textContent = 'Зупинити питання'
        buttonStop.classList.add('stop-question-button')
        startTestButtonDiv.append(buttonStop)
        buttonStop.addEventListener('click', () => {toggleStopQuestion(buttonStop)})
    })
}

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
    startTestButtonDiv.append(buttonStop)
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

function deleteUserHover(){
    let userNames = usersDiv.querySelectorAll('p')
    userNames.forEach(user => {
        let deleteUser = user.querySelector('.delete-user')
        user.addEventListener('mouseenter', () => {
            deleteUser.style.display = 'block'
            user.querySelector('b').style.filter = 'blur(0.6px)'
            user.querySelector('img').style.filter = 'blur(0.6px)'
        })
        user.addEventListener('mouseleave', () => {
            deleteUser.style.display = 'none'
            user.querySelector('b').style.filter = 'none'
            user.querySelector('img').style.filter = 'none'
        })
    })
}
deleteUserHover()

let linkDiv = document.querySelector('.link-div')
if (linkDiv){
    let overlayLink = linkDiv.querySelector('.overlay-link')
    console.log(overlayLink)
    linkDiv.addEventListener('mouseenter', () => {
        overlayLink.style.display = 'flex'
        linkDiv.querySelector('.link-div-head').style.filter = 'blur(0.6px)'
        linkDiv.querySelector('h1').style.filter = 'blur(0.8px)'
    })
    linkDiv.addEventListener('mouseleave', () => {
        overlayLink.style.display = 'none'
        linkDiv.querySelector('.link-div-head').style.filter = 'none'
        linkDiv.querySelector('h1').style.filter = 'none'
    })
    overlayLink.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href)
        overlayLink.style.display = 'none'
        linkDiv.querySelector('.link-div-head').style.filter = 'none'
        linkDiv.querySelector('h1').style.filter = 'none'
    })
}


