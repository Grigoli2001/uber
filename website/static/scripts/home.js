const locationBtn = document.getElementById('getLocation');

locationBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude);
        console.log(position);
    });
    });