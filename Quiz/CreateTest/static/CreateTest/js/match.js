let matchColors = ['#EFA929', '#29BDEF', '#8529EF', '#EF7229', '#3AAB23'];

function addOpacity(element, color){
    let r, g, b;
    if (color.startsWith('rgb')) {
        let rgbValues = color.match(/\d+/g);
        r = rgbValues[0];
        g = rgbValues[1];
        b = rgbValues[2];
    } else {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
    }
    element.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.75)`;
}

function updateImageAnswerInputs() {
    let imageInputs = document.querySelectorAll('.answer-image');
    imageInputs.forEach((input, index) => {
        input.name = `answer-image_${index}`;
    })
}
updateImageAnswerInputs();

function updateImageHintInputs() {
    let imageInputs = document.querySelectorAll('.hint-image');
    imageInputs.forEach((input, index) => {
        input.name = `hint-image_${index}`;
    })
}
updateImageHintInputs();

function deleteMatchDiv(event) {
    let matchDiv = event.currentTarget.closest('.match-div');
    let allMatchDivs = document.querySelectorAll('.match-div');
    if (allMatchDivs.length > 2) {
        matchDiv.remove();
        let remainingMatchDivs = document.querySelectorAll('.match-div');
        remainingMatchDivs.forEach((div, index) => {
            let hintDiv = div.querySelector('.hint-div');
            hintDiv.style.backgroundColor = matchColors[index];
            let answerDiv = div.querySelector('.answer-div');
            let color = matchColors[index];
            addOpacity(answerDiv, color)
        });

        updateImageAnswerInputs();
        updateImageHintInputs();
    } 
}

function addMatchDiv() {
    let allMatchDivs = document.querySelectorAll('.match-div');
    if (allMatchDivs.length < 5) {
        let matchDiv = document.querySelector('.match-div');
        let newMatchDiv = matchDiv.cloneNode(true);
        let color = matchColors[allMatchDivs.length];
        let hintDiv = newMatchDiv.querySelector('.hint-div');
        hintDiv.style.backgroundColor = color;
        let answerDiv = newMatchDiv.querySelector('.answer-div');
        addOpacity(answerDiv, color)
        
        let textareas = newMatchDiv.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.value = '';
        });
        
        let deleteButtons = newMatchDiv.querySelectorAll('.delete-answer-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', deleteMatchDiv);
        });
        
        let answersDiv = document.querySelector('.answers-div');
        let addButton = document.querySelector('.add-answer-button');
        answersDiv.insertBefore(newMatchDiv, addButton);

        updateImageAnswerInputs();
        updateImageHintInputs();
    } 
}

let deleteButtons = document.querySelectorAll('.delete-answer-button');
deleteButtons.forEach(button => {
    button.addEventListener('click', deleteMatchDiv);
});

let addButton = document.querySelector('.add-answer-button');
if (addButton) {
    addButton.addEventListener('click', addMatchDiv);
}

let imageAnswerHintButtons = document.querySelectorAll('.image-answer-button, .image-hint-button');
console.log(imageAnswerHintButtons.length)
imageAnswerHintButtons.forEach(button => {
    button.addEventListener('click', () => {
        let imageInput = button.nextElementSibling;
        imageInput.click();
    });
})