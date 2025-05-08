const quizCode = document.getElementById('test_code').textContent
let socketUrl = `ws://${window.location.host}/ws/quiz/${quizCode}/`
let existUser = false

let cookies = document.cookie.split(';')
for (let index = 0; index < cookies.length; index++) {
    if(`quiz_${quizCode}` == cookies[index].split('=')[0].trim()){
        existUser = true
        break
    }
}

function workSocket(){
    const socket = new WebSocket(socketUrl)
}

let auth = document.getElementById('auth').value
console.log(auth);

if(existUser || auth == 'True'){
    if(existUser){
        socketUrl += `?socket_exist=True`
    } else if(auth == 'True'){
        let name = document.getElementById('username').textContent
        document.cookie = `quiz_${quizCode}=${name}`
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
        document.cookie = `quiz_${quizCode}=${name}`
        socketUrl += `?name=${name}`
        workSocket()
        form.remove()
    })
}