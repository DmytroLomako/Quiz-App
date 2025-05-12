let selectElement = document.querySelector('.select-type');
selectElement.addEventListener('change', function() {
    const selectedValue = this.value;
    let redirectUrl = '';
    
    switch(selectedValue) {
        case 'multiple':
            redirectUrl = window.location.href.split('/');
            redirectUrl[redirectUrl.length - 3] = 'multiple_choice';
            break;
        case 'blank':
            redirectUrl = window.location.href.split('/');
            redirectUrl[redirectUrl.length - 3] = 'fill_in_the_blank';
            break;
        case 'match':
            redirectUrl = window.location.href.split('/');
            redirectUrl[redirectUrl.length - 3] = 'match';
            break;
    }
    
    if (redirectUrl) {
        window.location.href = redirectUrl.join('/');
    }
});

// document.querySelector('.button-back').addEventListener('click', function() {
//     window.history.back()
// });

let questionImageDiv = document.querySelector('.question-image-div')
let questionDiv = document.querySelector('.question-div')
let autoExpandingDiv = document.querySelector('.auto-expanding-div')
questionDiv.addEventListener('click', function(event) {
    autoExpandingDiv.focus();
})
autoExpandingDiv.addEventListener('focus', function(event) {
    questionImageDiv.style.backgroundColor = '#131e39'
});
autoExpandingDiv.addEventListener('focusout', function(event) {
    questionImageDiv.style.backgroundColor = '#213562'
});