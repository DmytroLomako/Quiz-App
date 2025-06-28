let coolForm = document.querySelector('.cool-form');
let loaderContainer = document.querySelector('.loader-container');

coolForm.addEventListener('submit', function(event){
    loaderContainer.style.display = 'flex';
})