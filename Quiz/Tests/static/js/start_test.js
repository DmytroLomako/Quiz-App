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

function coverQuestion() {
    let coverDiv = document.createElement('div')
    coverDiv.classList.add('cover')
    coverDiv.innerHTML = `Ви відповіли,<br>Зачекайте відповіді інших`
    document.body.append(coverDiv)
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
                    'question_number': data['question_number'],
                    'username': document.getElementById('username').textContent
                },
                success: function(response){
                    console.log(response)
                    let data = response.question
                    let questionDiv = document.querySelector('.question-block');
                    questionDiv.innerHTML = ''
                    let question = document.createElement('h2')
                    question.textContent = data['question']
                    questionDiv.append(question)
                    if (data['answer_type'] === 'multiple_choice') {
                        if (response.user_result){
                            if (!response.question_finished){
                                coverQuestion()
                            }
                        }
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
                            function buttonClickHandler() {
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
                                let html = answersDiv.innerHTML
                                answersDiv.innerHTML = ""
                                answersDiv.innerHTML = html
                                userAnswers.forEach(function(answer, index) {
                                    answersDiv.querySelectorAll('input')[index].checked = answer
                                })
                                buttonSubmit.removeEventListener('click', buttonClickHandler)
                                coverQuestion();
                            }
                            if (!response.user_result && !response.question_finished){
                                buttonSubmit.addEventListener('click', buttonClickHandler)
                            } else {
                                let results = response.user_result.result.split(',')
                                results.forEach(function(result, index) {
                                    console.log(result)
                                    if (result.indexOf('True') != -1){
                                        answersDiv.querySelectorAll('input')[index].checked = true
                                        answersDiv.querySelectorAll('.answer')[index].classList.add('selected')
                                    }
                                })
                            }
                            questionDiv.append(buttonSubmit)
                        } else if (response.user_result) {
                            let answersDiv = document.querySelector('.question-block').querySelectorAll('.answer')
                            answersDiv.forEach(function(answer){
                                if (answer.textContent == response.user_result.result) {
                                    answer.classList.add('selected')
                                }
                            })
                        }
                        answersDiv.querySelectorAll('.answer').forEach(function(answer) {
                            function singleButtonHandler(){
                                if (!response.question_finished){
                                    answer.classList.toggle('active')
                                    if (countCorrectAnsers > 1){
                                        answer.querySelector('input').checked = !answer.querySelector('input').checked
                                        answer.classList.toggle('selected')
                                    } else {
                                        socket.send(JSON.stringify({
                                            'type': 'send_answer',
                                            'username': document.getElementById('username').textContent,
                                            'answer': answer.textContent,
                                            'question_id': data['id']
                                        }))
                                        answer.classList.add('selected')
                                        let html = answersDiv.innerHTML
                                        answersDiv.innerHTML = ""
                                        answersDiv.innerHTML = html
                                        coverQuestion();
                                    }
                                }
                            }
                            answer.addEventListener('click', singleButtonHandler)
                            
                        }) 

                        if (response.question_finished){
                            let correct_answers = data['correct_answer'].split(', ')
                            correct_answers.forEach(function(answer, index){
                                let answerDiv = document.querySelector('.question-block').querySelectorAll('.answer')[index]
                                if (answer.indexOf('true') != -1){
                                    answerDiv.classList.add('correct')
                                } else {
                                    if (answerDiv.classList.contains('selected')){
                                        answerDiv.classList.add('incorrect')
                                    }
                                }
                            })
                        }
                    } else if (data['answer_type'] === 'fill_blank') {
                        let input = document.createElement('input')
                        input.classList.add('fill_blank_input')
                        questionDiv.append(input)
                        let buttonSubmit = document.createElement('button')
                        buttonSubmit.textContent = 'Відправити'
                        questionDiv.append(buttonSubmit)
                        if (response['user_result']){
                            input.value = response['user_result']['result']
                            if (!response.question_finished){
                                coverQuestion()
                            } else {
                                let correctAnswer = data['correct_answer']
                                let alternateAnswers = JSON.parse(data.answers.replace(/'/g, '"'))
                                let correct = false
                                alternateAnswers.forEach(function(altAns){
                                    if (altAns.type == 'exactly'){
                                        if (altAns.answer == input.value){
                                            correct = true
                                        }
                                    } else {
                                        if (input.value.indexOf(altAns.answer) != -1){
                                            correct = true
                                        }
                                    }
                                })
                                if (input.value == correctAnswer || correct){
                                    input.classList.add('correct')
                                } else {
                                    input.classList.add('incorrect')
                                }
                            
                            }
                        } else {
                            function buttonClickHandler() {
                                socket.send(JSON.stringify({
                                    'type': 'send_answer',
                                    'username': document.getElementById('username').textContent,
                                    'answer': input.value,
                                    'question_id': data['id']
                                }))
                                buttonSubmit.removeEventListener('click', buttonClickHandler)
                                coverQuestion();
                            }
                            buttonSubmit.addEventListener('click', buttonClickHandler)
                        }
                    }
                }
            })
        } else if(data['type'] == 'check_correct'){
            console.log(data)
            let coverDiv = document.querySelector('.cover');
            if (coverDiv){
                coverDiv.remove()
            }
            if (data['question_type'] == "multiple_choice"){
                let correct_answers = data['correct_answer'].split(', ')
                console.log(correct_answers)
                correct_answers.forEach(function(answer, index){
                    let answerDiv = document.querySelector('.question-block').querySelectorAll('.answer')[index]
                    if (answer.indexOf('true') != -1){
                        answerDiv.classList.add('correct')
                    } else {
                        if (answerDiv.classList.contains('selected')){
                            answerDiv.classList.add('incorrect')
                        }
                    }
                })
            } else if (data['question_type'] == 'fill_blank') {
                let userAnswer = document.querySelector('.fill_blank_input')
                let correctAnswer = data['correct_answer']
                let alternateAnswers = JSON.parse(data.answer.replace(/'/g, '"'))
                let correct = false
                alternateAnswers.forEach(function(altAns){
                    if (altAns.type == 'exactly'){
                        if (altAns.answer == userAnswer.value){
                            correct = true
                        }
                    } else {
                        if (userAnswer.value.indexOf(altAns.answer) != -1){
                            correct = true
                        }
                    }
                })
                if (userAnswer.value == correctAnswer || correct){
                    userAnswer.classList.add('correct')
                } else {
                    userAnswer.classList.add('incorrect')
                }
            }
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