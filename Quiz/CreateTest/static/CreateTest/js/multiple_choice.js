let autoExpandingAnswerDivs = document.querySelectorAll('.auto-expanding-answer-div');
let answerInputs = document.querySelectorAll('.answer-input');
let answerTextDivs = document.querySelectorAll('.answer-text-div');
const answerColors = ['#EFA929', '#29BDEF', '#8529EF', '#EF7229', '#3AAB23']
let allAnswerDivs = document.querySelectorAll('.answer-div');
// let questionIdInput = document.getElementById('questionIdInput');
if (questionIdInput) {
    autoExpandingAnswerDivs.forEach((div) => {
        let input = div.nextElementSibling;
        div.textContent = input.value;
    })
}

allAnswerDivs.forEach((div, index) => {
    div.style.backgroundColor = answerColors[index];
})

function addAnswerEvent(div) {
    div.style.maxWidth = window.getComputedStyle(div).width;
    let answerDiv = div.parentElement.parentElement;

    div.addEventListener('focus', (e) => {
        answerDiv.classList.add('obfuscation');
    })

    div.addEventListener('input', (e) => {
        div.nextElementSibling.value = div.textContent;
    })

    div.addEventListener('focusout', (e) => {
        answerDiv.classList.remove('obfuscation');
    })
};
autoExpandingAnswerDivs.forEach(addAnswerEvent)

answerTextDivs.forEach((div) => {
    div.addEventListener('click', (e) => {
        let autoExpandingAnswerDiv = div.querySelector('.auto-expanding-answer-div');
        autoExpandingAnswerDiv.focus();
    })
})

let checkboxes = document.querySelectorAll('.checkbox');

checkboxes.forEach((checkbox) => {
    console.log(checkbox.classList.contains('checked'), checkbox.classList)
    if (!checkbox.classList.contains('checked') && !checkbox.classList.contains('unchecked')) {
        checkbox.classList.add('unchecked');
    }
    checkbox.addEventListener('click', toggleCheckbox);
});

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

function updateImageInputs() {
    let imageInputs = document.querySelectorAll('.answer-image');
    imageInputs.forEach((input, index) => {
        input.name = `answer-image_${index}`;
    })
}

updateImageInputs();

function addAnswerDiv() {
    let allAnswerDivs = document.querySelectorAll('.answer-div');
    if (allAnswerDivs.length < 5) {
        const answerDiv = document.querySelector('.answer-div');
        const newAnswerDiv = answerDiv.cloneNode(true);
        newAnswerDiv.style.backgroundColor = answerColors[allAnswerDivs.length];
        newAnswerDiv.querySelector('.auto-expanding-answer-div').textContent = '';
        addAnswerEvent(newAnswerDiv.querySelector('.auto-expanding-answer-div'))
        newAnswerDiv.querySelector('.checkbox').classList.remove('checked');
        newAnswerDiv.querySelector('.checkbox').classList.add('unchecked');
        newAnswerDiv.querySelector('.checkbox-input').value = 'false';
        const deleteButton = newAnswerDiv.querySelector('.delete-answer-button');
        deleteButton.addEventListener('click', deleteAnswerDiv);
        const answersContainer = document.querySelector('.answers-div');
        answersContainer.insertBefore(newAnswerDiv, addAnswerButton);
    }
    allAnswerDivs = document.querySelectorAll('.answer-div');
    let answersDiv = document.querySelector('.answers-div');
    allAnswerDivs.forEach((div, index) => {
        div.querySelector('.auto-expanding-answer-div').style.maxWidth = `${(parseFloat(window.getComputedStyle(answersDiv).width) - 45 - 15 * (allAnswerDivs.length - 1)) / (allAnswerDivs.length) - 20}px`;
    })
    updateImageInputs();
}

let addAnswerButton = document.querySelector('.add-answer-button');
if (addAnswerButton) {
    addAnswerButton.addEventListener('click', addAnswerDiv);
}

let deleteAnswerButtons = document.querySelectorAll('.delete-answer-button');

function deleteAnswerDiv(event) {
    const answerDiv = event.currentTarget.closest('.answer-div');
    const allAnswerDivs = document.querySelectorAll('.answer-div');
    if (allAnswerDivs.length > 2) {
        answerDiv.remove();
        const answersDiv = document.querySelector('.answers-div');
        const allAnswerDivs = document.querySelectorAll('.answer-div');
        let width = (parseFloat(window.getComputedStyle(answersDiv).width) - 45 - 15 * (allAnswerDivs.length - 1)) / allAnswerDivs.length - 20
        allAnswerDivs.forEach((div, index) => {
            div.style.backgroundColor = answerColors[index];
            div.querySelector('.auto-expanding-answer-div').style.maxWidth = `${width}px`;
        })
    }
    updateImageInputs();
}
deleteAnswerButtons.forEach(button => {
    button.addEventListener('click', deleteAnswerDiv);
})

let imageAnswerButtons = document.querySelectorAll('.image-answer-button');
imageAnswerButtons.forEach(button => {
    button.addEventListener('click', () => {
        let imageInput = button.nextElementSibling;
        imageInput.click();
    });
})