let safeButton = document.querySelector('.save-question-button');
let closeButton = document.querySelector('.publish-cancel');
let overlay = document.querySelector('.overlay');
let testName = document.querySelector('.test-name');

function showOverlay() {
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

safeButton.addEventListener('click', showOverlay);
testName.addEventListener('click', showOverlay);

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

let imgElement = coverImage.querySelector('.img');
if (imgElement) {
    fetch(imgElement.src)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], "cover-image.png", { type: "image/png" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            coverImageInput.files = dataTransfer.files;
        })
        .catch(err => console.error("Error creating file from image:", err));
}

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

let questionDivs = document.querySelectorAll('.question-div');
let listRect = [];
function updateListRect(){
    listRect = []
    document.querySelectorAll('.question-div').forEach(function(qDiv){
        listRect.push([qDiv, qDiv.getBoundingClientRect()])
    })
}
questionDivs.forEach(function(qDiv){
    let dragButton = qDiv.querySelector('.button-drag');
    dragButton.addEventListener('mouseenter', function(e) {
        qDiv.draggable = true
    })
    dragButton.addEventListener('mouseleave', function(e) {
        qDiv.draggable = false
    })

    qDiv.addEventListener('dragstart', updateListRect)

    qDiv.addEventListener('drag', function(event){
        let qDivFlag = false
        listRect.forEach(function(rect, rectIndex) {
            if (rect[0] != qDiv) {
                if (qDivFlag) {
                    // Элементы ниже
                    if (event.clientY > rect[1].top && event.clientY < rect[1].bottom) {
                        let scrollY = qDiv.parentElement.scrollTop
                        qDiv.parentElement.insertBefore(qDiv, rect[0].nextSibling)
                        qDiv.parentElement.scrollTop = scrollY
                        console.log('down')
                        updateListRect();
                        // window.scrollTo(0, scrollY)
                        // window.scrollTo(0, window.scrollY + qDiv.getBoundingClientRect().height)
                    }
                } else {
                    // Элементы выше
                    if (event.clientY < rect[1].bottom && event.clientY > rect[1].top && event.clientY != 0) {
                        let scrollY = qDiv.parentElement.scrollTop
                        qDiv.parentElement.insertBefore(qDiv, rect[0])
                        qDiv.parentElement.scrollTop = scrollY
                        console.log(event.clientY)
                        console.log('up')
                        updateListRect();
                    }
                }
            } else {
                qDivFlag = true
            }
        })
    })
    
    qDiv.addEventListener('dragend', function(event) {
        console.log('finish')
    })
})
// window.addEventListener('scroll', () => {
//     updateListRect()
//     console.log('scroll')
// })