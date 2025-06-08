let addAlternateButton = document.querySelector('.alternate-answer-button');
if (addAlternateButton) {
    addAlternateButton.addEventListener('click', addAlternateAnswer);
}
let select = document.querySelectorAll('.select');
select.forEach(selectChange);

function addAlternateAnswer() {
    let alternateAnswersContainer = document.querySelector('.alternate-answers');
    let alternateAnswerTemplate = document.querySelector('.alternate-answer');
    newAlternateAnswer = alternateAnswerTemplate.cloneNode(true);
    let input = newAlternateAnswer.querySelector('.alternate-answer-input');
    if (input) {
        input.value = '';
    }
    let select = newAlternateAnswer.querySelector('.select');
    let selectInput = newAlternateAnswer.querySelector('.select-input');
    selectInput.value = select.options[select.selectedIndex].value;
    selectChange(select);
    let trashButton = newAlternateAnswer.querySelector('button');
    if (trashButton) {
        trashButton.addEventListener('click', deleteAlternateAnswer);
    }
    let addButtonContainer = document.querySelector('.alternate-answers > div:last-child');
    alternateAnswersContainer.insertBefore(newAlternateAnswer, addButtonContainer);
    alternateAnswersContainer.scrollTop = alternateAnswersContainer.scrollHeight;
}

function selectChange(select) {
    select.addEventListener('change', () => {
        let selectedOption = select.options[select.selectedIndex];
        let selectInput = select.nextElementSibling
        selectInput.value = selectedOption.value;
        console.log(selectInput.value);
    })
    console.log(select.value);
}

function deleteAlternateAnswer(event) {
    let alternateAnswer = event.currentTarget.closest('.alternate-answer');
    let allAlternateAnswers = document.querySelectorAll('.alternate-answer');
    if (allAlternateAnswers.length > 1) {
        alternateAnswer.remove();
    } else {
        let input = alternateAnswer.querySelector('.alternate-answer-input');
        if (input) {
            input.value = '';
        }
    }
}

let trashButtons = document.querySelectorAll('.alternate-answer button');
trashButtons.forEach(button => {
    button.addEventListener('click', deleteAlternateAnswer);
});