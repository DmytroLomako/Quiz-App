let deleteTestButtons = document.querySelectorAll('.delete-test-button')
deleteTestButtons.forEach(button => {
    button.addEventListener('click', function(e){
        $.ajax({
            url: button.getAttribute('value'),
            type: 'POST',
            data: {
                'csrfmiddlewaretoken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            success: function(response){
                button.parentElement.parentElement.remove()
            }
        })
    })
})