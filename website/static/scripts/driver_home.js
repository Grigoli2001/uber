async function handleAccept(e, id){
    e.preventDefault();
    console.log(id);
    const response = await fetch('/driver/ride/accept', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
        credentials: 'include',
    });
    const data = await response.json();
    console.log(data);
    if (data.success) {
        window.location.href = '/driver';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const acceptForms = document.querySelectorAll('.acceptForm');
    
    acceptForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requestId = this.getAttribute('data-request-id');
            handleAccept(e, requestId);
        });
    });
});