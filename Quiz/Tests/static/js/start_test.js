const quizCode = document.getElementById('test_code').textContent
let socketUrl = `ws://${window.location.host}/ws/quiz/${quizCode}/`
let existUser = false
let socket = null
let waitingText = document.querySelector('.waiting-text')
let header = document.querySelector('header')
const answerColors = ['#EFA929', '#29BDEF', '#8529EF', '#EF7229', '#3AAB23']
let answerMatchColors = ['#efaa2abf', '#29bdefbf', '#8529efbf', '#ef7229bf', '#3aab23bf'];

let cookies = document.cookie.split(';')
for (let index = 0; index < cookies.length; index++) {
    if(`quiz_${quizCode}` == cookies[index].split('=')[0].trim()){
        existUser = true
        break
    }
}

function setCheckboxes(){
    let checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach((checkbox) => {
        if (!checkbox.classList.contains('checked') && !checkbox.classList.contains('unchecked')) {
            checkbox.classList.add('unchecked');
        }
        checkbox.addEventListener('click', toggleCheckbox);
    });

}
function toggleCheckbox(event) {
    const checkbox = event.currentTarget;
    if (checkbox.classList.contains('checked')) {
        checkbox.classList.remove('checked');
        checkbox.classList.add('unchecked');
    } else {
        checkbox.classList.remove('unchecked');
        checkbox.classList.add('checked');
    }
    const hiddenInput = checkbox.querySelector('input');
    if (hiddenInput) {
        hiddenInput.value = checkbox.classList.contains('checked') ? 'true' : 'false';
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
        console.log('received', data)
        if(data['type'] == 'user_disconnect' && data['receiver'] == 'user'){
            if (data['username'] == document.getElementById('username').textContent){
                let cookie = `quiz_${quizCode}`
                document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                window.location.href = '/tests/delete_from_test'
            }
        } else if(data['type'] == 'get_question'){
            waitingText.remove()
            document.querySelector('.main').classList.add('test')
            document.querySelector('.question-block-inactive').classList.add('question-block')
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
                    let div = document.createElement('div')
                    div.classList.add('question-div')
                    let question = document.createElement('h2')
                    question.textContent = data['question']

                    questionDiv.append(div)
                    
                    // questionDiv.append(question)
                    if (data.image){
                        let questionImageWrapper = document.createElement('div')
                        questionImageWrapper.classList.add('question-image-wrapper')
                        let questionImage = document.createElement('img')
                        questionImage.src = data.image
                        questionImage.classList.add('question-image')
                        // questionDiv.append(questionImage)
                        questionImageWrapper.append(questionImage)
                        div.append(questionImageWrapper)
                        console.log(questionImage.naturalWidth, questionImage.naturalHeight)
                        if (questionImage.naturalWidth > questionImage.naturalHeight){
                            questionImage.classList.add('horizontal')
                        } else {
                            questionImage.classList.add('vertical')
                        }
                    }
                    div.append(question)
                    if (data['answer_type'] === 'multiple_choice') {
                        if (response.user_result){
                            if (!response.question_finished){
                                coverQuestion()
                            }
                        }
                        let multipleChoiceDiv = document.createElement('div')
                        multipleChoiceDiv.classList.add('multiple-choice')
                        let answers = JSON.parse(data['answers'].replace(/'/g, '"'))
                        let answersDiv = document.createElement('div')
                        answersDiv.classList.add('answers')
                        multipleChoiceDiv.append(answersDiv)
                        questionDiv.append(multipleChoiceDiv)
                        // questionDiv.append(answersDiv)
                        console.log(data)
                        let answerImages = response.answer_images
                        let countCorrectAnsers = data['correct_answer'].split('true').length - 1;
                        for (let index = 0; index < answers.length; index++) {
                            if (countCorrectAnsers > 1){
                                answersDiv.innerHTML += `<div class='answer'><div class='checkbox unchecked'><input style="display: none;" type='checkbox'></div>${answers[index]}</div>`
                            } else {
                                answersDiv.innerHTML += `<div class='answer'>${answers[index]}</div>`
                            }
                            if (answerImages[index]){
                                let blockImg = document.createElement('div')
                                blockImg.classList.add('block-image')
                                let answerImage = document.createElement('img')
                                answerImage.src = answerImages[index]
                                answerImage.classList.add('answer-image')
                                answersDiv.querySelectorAll('.answer')[index].prepend(blockImg)
                                blockImg.append(answerImage)
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
                                    console.log(answer)
                                    if (answer == true){
                                        answersDiv.querySelectorAll('.checkbox').classList.add(`checked`)
                                        answersDiv.querySelector('.checkbox').classList.remove('unchecked')
                                    }
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
                                        answersDiv.querySelectorAll('.checkbox').classList.add('checked')
                                        answersDiv.querySelector('.checkbox').classList.remove('unchecked')
                                        answersDiv.querySelectorAll('input')[index].checked = true
                                        answersDiv.querySelectorAll('.answer')[index].classList.add('selected')
                                    }
                                })
                            }
                            multipleChoiceDiv.append(buttonSubmit)
                        } else if (response.user_result) {
                            let answersDiv = document.querySelector('.question-block').querySelectorAll('.answer')
                            answersDiv.forEach(function(answer){
                                if (answer.textContent == response.user_result.result) {
                                    answer.classList.add('selected')
                                    answer.querySelector('.checkbox').classList.add('checked')
                                    answer.querySelector('.checkbox').classList.remove('unchecked')
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
                                        answer.querySelector('.checkbox').classList.toggle('checked')
                                        answer.querySelector('.checkbox').classList.toggle('unchecked')
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
                                    answerDiv.style.backgroundColor = 'green'
                                } else {
                                    if (answerDiv.classList.contains('selected')){
                                        answerDiv.classList.add('incorrect')
                                        answerDiv.style.backgroundColor = 'red'
                                    }
                                }
                            })
                        }

                        let answerDivs = document.querySelectorAll('.answer')
                        answerDivs.forEach((div, index) => {
                            div.style.backgroundColor = answerColors[index]
                        })
                    } else if (data['answer_type'] === 'fill_blank') {
                        let fillBlankDiv = document.createElement('div')
                        fillBlankDiv.classList.add('fill-blank-div')
                        let fillBlankInputDiv = document.createElement('div')
                        fillBlankInputDiv.classList.add('fill-blank-input-div')
                        let input = document.createElement('input')
                        input.classList.add('fill_blank_input')
                        input.placeholder = 'Ввести відповідь'
                        fillBlankInputDiv.append(input)
                        fillBlankDiv.append(fillBlankInputDiv)
                        let buttonSubmit = document.createElement('button')
                        buttonSubmit.textContent = 'Відправити'
                        fillBlankDiv.append(buttonSubmit)
                        questionDiv.append(fillBlankDiv)
                        if (response['user_result']){
                            input.value = response['user_result']['result']
                            if (!response.question_finished){
                                coverQuestion()
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
                        if (response.question_finished){
                            let correctAnswer = data['correct_answer']
                            let alternateAnswers = []
                            if (data.answers) {
                                alternateAnswers = JSON.parse(data.answers.replace(/'/g, '"'))
                            }
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
                                input.style.backgroundColor = 'green'
                            } else {
                                input.classList.add('incorrect')
                                input.style.backgroundColor = 'red'
                            }
                        }
                    } else if (data['answer_type'] === 'match') {
                        let matchDiv = document.createElement('div')
                        matchDiv.classList.add('match-div')
                        let hints = JSON.parse(data['correct_answer'].replace(/'/g, '"'))
                        let answers = JSON.parse(data['answers'].replace(/'/g, '"'))
                        let answersDiv = document.createElement('div')
                        let hintsDiv = document.createElement('div')
                        
                        let answerImages = response.answer_images

                        answersDiv.classList.add('answers-div')
                        hintsDiv.classList.add('hints-div')
                        questionDiv.append(matchDiv)
                        matchDiv.append(hintsDiv)
                        matchDiv.append(answersDiv)
                        answers.forEach(function(answerText, index){
                            let answer = document.createElement('div')
                            answer.textContent = answerText
                            answer.classList.add('answer-match')
                            answersDiv.append(answer)
                            if (answerImages[`answer_${index}`]){
                                let blockImg = document.createElement('div')
                                blockImg.classList.add('block-image')
                                let answerImg = document.createElement('img')
                                answerImg.draggable = false
                                answerImg.src = answerImages[`answer_${index}`]
                                blockImg.append(answerImg)
                                answer.prepend(blockImg)
                            }
                            // answer.style.width = `${90 / answers.length}%`
                        })
                        hints.forEach(function(hintText, index){
                            let hintWrapper = document.createElement('div')
                            hintWrapper.classList.add('hint-wrapper')
                            let hint = document.createElement('div')
                            console.log(answerImages[`hint_${index}`])
                            hint.textContent = hintText
                            if (answerImages[`hint_${index}`]){
                                let blockImg = document.createElement('div')
                                blockImg.classList.add('block-image')
                                let hintImg = document.createElement('img')
                                hintImg.draggable = false   
                                hintImg.src = answerImages[`hint_${index}`]
                                blockImg.append(hintImg)
                                hint.prepend(blockImg)
                            }
                            hint.classList.add('hint-match')
                            hint.id = `hint-${index}`
                            hintsDiv.append(hintWrapper)
                            hintWrapper.append(hint)
                            // hintWrapper.style.width = `${90 / hints.length}%`
                            if (!response.question_finished && !response.user_result) {
                                hint.addEventListener('mousedown', function(event) {
                                    let hintRect = hint.getBoundingClientRect()
                                    hint.style.zIndex = 1
                                    let start_x = hintRect.x
                                    let start_y = hintRect.y
                                    move(event);
                                    function move(event){
                                        let hintRect = hint.getBoundingClientRect()
                                        let x = parseInt(event.clientX - hintRect.width / 2 - start_x)
                                        let y = parseInt(event.clientY - hintRect.height / 2 - start_y)
                                        hint.style.left = `${x}px`;
                                        hint.style.top = `${y}px`;
                                    }
                                    document.addEventListener('mousemove', move)
                                    function setHint(eventUp){
                                        let answers = document.querySelectorAll('.answer-match')
                                        let add = false
                                        answers.forEach(function(answer){
                                            let answerRect = answer.getBoundingClientRect()
                                            if (eventUp.clientX > answerRect.x && eventUp.clientX < answerRect.right && eventUp.clientY > answerRect.top && eventUp.clientY < answerRect.bottom) {
                                                if (answer.querySelector('.hint-match') == null || answer.querySelector('.hint-match') == hint) {
                                                    answer.appendChild(hint)
                                                    add = true
                                                }
                                            }
                                        })
                                        if (!add){
                                            hintWrapper.appendChild(hint)
                                        }
                                        document.removeEventListener('mousemove', move)
                                        hint.removeEventListener('mouseup', setHint)
                                        hint.style.left = `0px`;
                                        hint.style.top = `0px`;
                                        hint.style.zIndex = 0
                                    }
                                    hint.addEventListener('mouseup', setHint)
                                })
                            }
                            document.querySelectorAll('.hint-match').forEach((h, index) => {
                                h.style.backgroundColor = answerColors[index]
                            })
                        })
                        let buttonSubmit = document.createElement('button')
                        buttonSubmit.textContent = 'Відправити'
                        buttonSubmit.classList.add('button-submit')
                        matchDiv.append(buttonSubmit)
                        function submitMatch(){
                            let answers = document.querySelectorAll('.answer-match')
                            let hintsText = []
                            answers.forEach(function(answer){
                                if (answer.querySelector('.hint-match')){
                                    hintsText.push(answer.querySelector('.hint-match').textContent)
                                }
                            })
                            if (answers.length == hintsText.length){
                                socket.send(JSON.stringify({
                                    'type': 'send_answer',
                                    'username': document.getElementById('username').textContent,
                                    'answer': JSON.stringify(hintsText),
                                    'question_id': data['id']
                                }))
                            }
                            buttonSubmit.removeEventListener('click', submitMatch)
                        }
                        console.log(response.question_finished, response.user_result)
                        if (!response.question_finished && !response.user_result) { 
                            buttonSubmit.addEventListener('click', submitMatch)
                        } else {
                            let user_result = JSON.parse(response.user_result.result.replace(/'/g, '"'))
                            let correctAnswer = JSON.parse(data['correct_hints'].replace(/'/g, '"'))
                            let answers = document.querySelectorAll('.answer-match')
                            user_result.forEach(function(hint, index){
                                let hints = document.querySelectorAll('.hint-match')
                                hints.forEach(function(hintDiv){
                                    if (hintDiv.textContent == hint){
                                        answers[index].appendChild(hintDiv)
                                    }
                                })
                            })
                            answers.forEach(function(answer, index){
                                if (answer.querySelector('.hint-match')){
                                    if (answer.querySelector('.hint-match').textContent == correctAnswer[index]){
                                        answer.querySelector('.hint-match').classList.add('correct')
                                        answer.querySelector('.hint-match').style.backgroundColor = 'green'
                                    } else {
                                        answer.querySelector('.hint-match').classList.add('incorrect')
                                        answer.querySelector('.hint-match').style.backgroundColor = 'red'
                                    }
                                } else {
                                    answer.classList.add('incorrect')
                                    answer.style.backgroundColor = 'red'
                                }
                            })
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
                        answerDiv.style.backgroundColor = 'green'
                    } else {
                        if (answerDiv.classList.contains('selected')){
                            answerDiv.classList.add('incorrect')
                            answerDiv.style.backgroundColor = 'red'
                        }
                    }
                })
            } else if (data['question_type'] == 'fill_blank') {
                let userAnswer = document.querySelector('.fill_blank_input')
                let correctAnswer = data['correct_answer']
                let alternateAnswers = []
                if (data.answer){
                    alternateAnswers = JSON.parse(data.answer.replace(/'/g, '"'))
                }
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
                    userAnswer.style.backgroundColor = 'green'
                } else {
                    userAnswer.classList.add('incorrect')
                    userAnswer.style.backgroundColor = 'red'
                }
            } else if (data['question_type'] == 'match') {
                let answers = document.querySelectorAll('.answer-match')
                let correctAnswer = JSON.parse(data['correct_answer'].replace(/'/g, '"'))
                answers.forEach(function(answer, index){
                    if (answer.querySelector('.hint-match')){
                        if (answer.querySelector('.hint-match').textContent == correctAnswer[index]){
                            answer.querySelector('.hint-match').classList.add('correct')
                            answer.querySelector('.hint-match').style.backgroundColor = 'green'
                        } else {
                            answer.querySelector('.hint-match').classList.add('incorrect')
                            answer.querySelector('.hint-match').style.backgroundColor = 'red'
                        }
                    } else {
                        answer.classList.add('incorrect')
                        answer.style.backgroundColor = 'red'
                    }
                })

            }
        } else if(data['type'] == 'stop_test'){
            let auth = document.getElementById('auth').value
            if (auth == 'True'){
                let userId = document.getElementById('userId').value
                data['list_results_auth'].forEach(function(result){
                    if (result.user == userId){
                        window.location.href = `/results/view_user_result/${result.result_url}`
                    }
                    console.log(result)
                })
            } else {
                let username = document.getElementById('username').textContent
                data['list_results_not_auth'].forEach(function(result){
                    if (result.username == username){
                        window.location.href = `/results/view_user_result/${result.result_url}`
                    }
                    console.log(result)
                })
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
            socketUrl += `&name=${name}`
            let usernameHeader = document.createElement('h3')
            usernameHeader.id = 'username'
            usernameHeader.textContent = name
            header.insertBefore(usernameHeader, header.firstChild)
        }
    } else if(auth == 'True'){
        let name = document.getElementById('username').textContent
        document.cookie = `quiz_${quizCode}=${name}; path=/;`
    }
    workSocket()
} else {
    header.style.display = 'none'
    let main = document.querySelector('.main')
    let form = document.createElement('form')
    let mainBlock = document.createElement('main')
    mainBlock.style.backgroundImage = `url(/static/img/background.png)`
    mainBlock.innerHTML += '<h1>QuizMaster</h1>'
    main.style.display = 'none'
    // main.style.backgroundImage = `url(${main.getAttribute('image')})`
    form.classList.add('join-form')
    // document.head.innerHTML += `<link rel="stylesheet" href="/static/css/join.css">`
    form.innerHTML = `
        <input type="text" class="code-input" name="name" placeholder="Ваше ім'я">
        <button id="sendName">Відправити</button>
    `
    document.body.append(mainBlock)
    mainBlock.append(form)
    console.log(document.querySelector('body').innerHTML)
    form.addEventListener('submit', (e)=>{
        e.preventDefault()
        let name = e.target[0].value
        let usernameHeader = document.createElement('h3')
        usernameHeader.textContent = name
        usernameHeader.id = 'username'
        header.insertBefore(usernameHeader, header.firstChild)
        header.style.display = 'flex'
        document.cookie = `quiz_${quizCode}=${name}; path=/;`
        socketUrl += `?name=${name}`
        main.style.display = 'flex'
        // main.style.backgroundImage = ''
        // document.head.innerHTML = document.head.innerHTML.replace('<link rel="stylesheet" href="/static/css/join.css">', '');
        workSocket()
        mainBlock.remove()
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