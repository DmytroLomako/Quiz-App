let safeButton = document.querySelector('.save-question-button');
let closeButton = document.querySelector('.publish-cancel');
let overlay = document.querySelector('.overlay');
safeButton.addEventListener('click', function() {
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});
closeButton.addEventListener('click', function() {
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto';
});

let coverImageDiv = document.querySelector('.cover-image-div');
let coverImageInput = document.querySelector('.cover-image-input');
coverImageDiv.addEventListener('click', function() {
    coverImageInput.click();
});

let coverImage = document.querySelector('.cover-image');
coverImage.addEventListener('mouseenter', function() {
    console.log('hover')
    coverImage.querySelector('.cover-image-actions').style.display = 'flex';
})
coverImage.addEventListener('mouseleave', function() {
    coverImage.querySelector('.cover-image-actions').style.display = 'none';
})

function displayImage(){
    if (this.files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            let imgElement = coverImage.querySelector('.img');
            if (!imgElement) {
                imgElement = document.createElement('img');
                imgElement.classList.add('img');
                coverImage.appendChild(imgElement);
            }
            coverImageDiv.style.display = 'none';
            imgElement.src = e.target.result;
            coverImage.style.display = 'flex'
        };
        reader.readAsDataURL(this.files[0]);
    }
}

coverImageInput.addEventListener('change', displayImage);
let imageCoverButton = document.querySelector('.image-cover-button');
imageCoverButton.addEventListener('click', function() {
    coverImageInput.click();
});

let deleteImageButton = document.querySelector('.delete-image-button');
deleteImageButton.addEventListener('click', function() {
    let imgElement = coverImage.querySelector('.img');
    if (imgElement) {
        imgElement.remove();
        coverImage.style.display = 'none'
        coverImageDiv.style.display = 'flex';
    }
    coverImageInput.value = '';
});