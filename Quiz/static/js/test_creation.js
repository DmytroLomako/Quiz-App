const selectElement = document.querySelector('.select-type');
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