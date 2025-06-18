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

let imageInputs = document.querySelectorAll('.answer-image');
imageInputs.forEach((input) => {
    input.addEventListener('change', (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            let imgElement = input.parentElement.nextElementSibling.querySelector('.img');
            if (!imgElement) {
                imgElement = document.createElement('img');
                imgElement.classList.add('img');
                console.log(input.parentElement, input.parentElement.nextElementSibling)
                input.parentElement.nextElementSibling.appendChild(imgElement);
            }
            imageIconDiv.style.display = 'none';
            imgElement.src = e.target.result;
            input.parentElement.nextElementSibling.style.display = 'flex'
        };
        reader.readAsDataURL(file);
    });
})
let answerImageDivs = document.querySelectorAll('.answer-image-div');
answerImageDivs.forEach((div) => {
    div.addEventListener('mouseenter', function(){
        div.querySelector('.answer-image-actions').style.display = 'flex';
    })
    div.addEventListener('mouseleave', function(){
        div.querySelector('.answer-image-actions').style.display = 'none';
    })
})
let deleteAnswerImageButtons = document.querySelectorAll('.delete-answer-image-button');
deleteAnswerImageButtons.forEach((button) => {
    button.addEventListener('click', function(){
        console.log('click')
        let imgElement = button.parentElement.parentElement.parentElement.querySelector('.img');
        if (imgElement) {
            imgElement.remove();
            button.parentElement.parentElement.style.display = 'none'
        }
        button.parentElement.parentElement.parentElement.parentElement.querySelector('.answer-image').value = '';
        button.parentElement.parentElement.parentElement.style.display = 'none';
    })
})
let answerDiv = document.querySelector('.answers-div');
let answerImageElems = answerDiv.querySelectorAll('.img')
console.log(answerDiv)
if (answerImageElems.length > 0) {
    answerImageElems.forEach((imgElement) => {
        fetch(imgElement.src)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "cover-image.png", { type: "image/png" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                imgElement.parentElement.parentElement.querySelector('.answer-image').files = dataTransfer.files;
            })
            .catch(err => console.error("Error creating file from image:", err));
    })
}