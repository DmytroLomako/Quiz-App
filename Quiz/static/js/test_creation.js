let selectElement = document.querySelector('.select-type');
let questionIdInput = document.getElementById('questionIdInput');
selectElement.addEventListener('change', function() {
    const selectedValue = this.value;
    let redirectUrl = '';
    
    switch(selectedValue) {
        case 'multiple':
            redirectUrl = window.location.href.split('/');
            console.log(redirectUrl)
            if (questionIdInput) {
                redirectUrl[redirectUrl.length - 1] = 'multiple_choice';
            } else {
                redirectUrl[redirectUrl.length - 3] = 'multiple_choice';
            }
            console.log(redirectUrl)
            break;
        case 'blank':
            redirectUrl = window.location.href.split('/');
            if (questionIdInput) {
                redirectUrl[redirectUrl.length - 1] = 'fill_blank';
            } else {
                redirectUrl[redirectUrl.length - 3] = 'fill_blank';
            }
            break;
        case 'match':
            redirectUrl = window.location.href.split('/');
            if (questionIdInput) {
                redirectUrl[redirectUrl.length - 1] = 'match';
            } else {
                redirectUrl[redirectUrl.length - 3] = 'match';
            }
            break;
    }
    
    if (redirectUrl) {
        console.log(redirectUrl)
        window.location.href = redirectUrl.join('/');
    }
});

// document.querySelector('.button-back').addEventListener('click', function() {
//     window.history.back()
// });

let questionImageDiv = document.querySelector('.question-image-div')
let questionDiv = document.querySelector('.question-div')
let autoExpandingDiv = document.querySelector('.auto-expanding-div')
let questionInput = document.getElementById('questionInput')

if (questionIdInput) {
    let questionInput = autoExpandingDiv.nextElementSibling;
    autoExpandingDiv.textContent = questionInput.value;
}

questionDiv.addEventListener('click', function(event) {
    autoExpandingDiv.focus();
})
autoExpandingDiv.addEventListener('focus', function(event) {
    questionImageDiv.style.backgroundColor = '#131e39'
});
autoExpandingDiv.addEventListener('input', function(event) {
    questionInput.value = autoExpandingDiv.textContent
});
autoExpandingDiv.addEventListener('focusout', function(event) {
    questionImageDiv.style.backgroundColor = '#213562'
});

let buttonSave = document.querySelector('.save-question-button')
let form = document.querySelector('.test-creation-window')
buttonSave.addEventListener('click', function(event){
    event.preventDefault()
    let timeSelect = document.getElementById('timeSelect')
    let time = timeSelect.options[timeSelect.selectedIndex].value
    let timeInput = document.getElementById('timeInput')
    timeInput.value = time
    form.submit();
})

let imageQuestionButtons = document.querySelectorAll('.image-question-button');
let imageInput = document.querySelector('.question_image')
imageQuestionButtons.forEach((button) => {
    button.addEventListener('click', () => {
        imageInput.click();
    });
});

let questionImage = document.querySelector('#question-image');
questionImage.addEventListener('mouseenter', function() {
    console.log('hover')
    questionImage.querySelector('.question-image-actions').style.display = 'flex';
})
questionImage.addEventListener('mouseleave', function() {
    questionImage.querySelector('.question-image-actions').style.display = 'none';
})
let imageIconDiv = document.querySelector('.image-icon-div');

imageInput.addEventListener('change', function() {
    if (this.files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            let imgElement = questionImage.querySelector('.img');
            if (!imgElement) {
                imgElement = document.createElement('img');
                imgElement.classList.add('img');
                questionImage.appendChild(imgElement);
            }
            imageIconDiv.style.display = 'none';
            imgElement.src = e.target.result;
            questionImage.style.display = 'flex'
        };
        reader.readAsDataURL(this.files[0]);
    }
});

let deleteImageButton = document.querySelector('.delete-image-button');
deleteImageButton.addEventListener('click', function() {
    let imgElement = questionImage.querySelector('.img');
    if (imgElement) {
        imgElement.remove();
        questionImage.style.display = 'none'
        imageIconDiv.style.display = 'flex';
    }
    imageInput.value = '';
});