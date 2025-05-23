const quizCode = document.getElementById('test_code').textContent
let socketUrl = `ws://${window.location.host}/ws/quiz/${quizCode}/`
let existUser = false
let socket = null

let cookies = document.cookie.split(';')
for (let index = 0; index < cookies.length; index++) {
    if(`quiz_${quizCode}` == cookies[index].split('=')[0].trim()){
        existUser = true
        break
    }
}

function workSocket(){
    socket = new WebSocket(socketUrl)
    socket.onmessage = function(event){
        let data = JSON.parse(event.data)
        if(data['type'] == 'user_disconnect' && data['receiver'] == 'user'){
            if (data['username'] == document.getElementById('username').textContent){
                let cookie = `quiz_${quizCode}`
                document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                window.location.href = '/tests/delete_from_test'
            }
        } else if(data['type'] == 'get_question'){
            $.ajax({
                url: '/tests/get_question',
                type: 'POST',
                data: {
                    'csrfmiddlewaretoken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'test_id': data['test_id'],
                    'question_number': data['question_number']
                },
                success: function(response){
                    let data = response.question
                    let questionDiv = document.querySelector('.question-block');
                    let question = document.createElement('h2')
                    question.textContent = data['question']
                    questionDiv.append(question)
                    if (data['answer_type'] === 'multiple_choice') {
                        let answers = JSON.parse(data['answers'].replace(/'/g, '"'))
                        let answersDiv = document.createElement('div')
                        questionDiv.append(answersDiv)
                        console.log(data)
                        let countCorrectAnsers = data['correct_answer'].split('true').length - 1;
                        for (let index = 0; index < answers.length; index++) {
                            if (countCorrectAnsers > 1){
                                answersDiv.innerHTML += `<div class='answer'><input type='checkbox'>${answers[index]}</div>`
                            } else {
                                answersDiv.innerHTML += `<div class='answer'>${answers[index]}</div>`
                            }
                        }
                        if (countCorrectAnsers > 1){
                            let buttonSubmit = document.createElement('button')
                            buttonSubmit.textContent = 'Відправити'
                            buttonSubmit.addEventListener('click', () => {
                                let userAnswers = []
                                answersDiv.querySelectorAll('input').forEach(function(input) {
                                    userAnswers.push(input.checked)
                                })
                                socket.send(JSON.stringify({
                                    'type': 'send_answer',
                                    'username': document.getElementById('username').textContent,
                                    'answer': userAnswers,
                                    'question_id': data['id']
                                }))
                            })
                            questionDiv.append(buttonSubmit)
                        }
                        answersDiv.querySelectorAll('.answer').forEach(function(answer) {
                            answer.addEventListener('click', () => {
                                answer.classList.toggle('active')
                                if (countCorrectAnsers > 1){
                                    answer.querySelector('input').checked = !answer.querySelector('input').checked
                                } else {
                                    socket.send(JSON.stringify({
                                        'type': 'send_answer',
                                        'username': document.getElementById('username').textContent,
                                        'answer': answer.textContent,
                                        'question_id': data['id']
                                    }))
                                }
                            })
                        })
                    }
                }
            })
        }
    }
}

let auth = document.getElementById('auth').value
console.log(auth);

if(existUser || auth == 'True'){
    if(existUser){
        socketUrl += `?socket_exist=True`
        if (auth == 'False'){
            let name = cookies.find(cookie => cookie.trim().startsWith(`quiz_${quizCode}=`)).split('=')[1]
            let usernameHeader = document.createElement('h3')
            usernameHeader.id = 'username'
            usernameHeader.textContent = name
            document.body.append(usernameHeader)
        }
    } else if(auth == 'True'){
        let name = document.getElementById('username').textContent
        document.cookie = `quiz_${quizCode}=${name}; path=/;`
    }
    workSocket()
} else {
    let form = document.createElement('form')
    form.innerHTML = `
        <input type="text" name="name" placeholder="Ваше ім'я">
        <button id="sendName">Відправити</button>
    `
    document.querySelector('body').append(form)
    form.addEventListener('submit', (e)=>{
        e.preventDefault()
        let name = e.target[0].value
        let usernameHeader = document.createElement('h3')
        usernameHeader.textContent = name
        usernameHeader.id = 'username'
        document.body.append(usernameHeader)
        document.cookie = `quiz_${quizCode}=${name}; path=/;`
        socketUrl += `?name=${name}`
        workSocket()
        form.remove()
    })
}

let buttonExit = document.getElementById('button-exit')
buttonExit.addEventListener('click', () => {
    if (socket){
        let cookie = `quiz_${quizCode}`
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        socket.send(JSON.stringify({
            'type': 'user_disconnect',
            'username': document.getElementById('username').textContent
        }))
    }
    window.location.href = '/'
})