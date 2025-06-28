let createButton = document.querySelector('.button-create')
let overlayBase = document.querySelector('.overlay-base')
let crossPopup = document.querySelector('.cross-popup')

if (createButton) {
    createButton.addEventListener('click', function () {
        overlayBase.style.display = 'flex'
    })
    crossPopup.addEventListener('click', function () {
        overlayBase.style.display = 'none'
    })
}