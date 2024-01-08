const locationBtn = document.getElementById('getLocation');
const startLocationHome = document.getElementById('startLocationHome');
const endLocationHome = document.getElementById('endLocationHome');
let currentLocation;
locationBtn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(position);

    currentLocation = { lat: latitude, lng: longitude };
  });
});
window.addEventListener('load', () => {
  initAutoComplete();
});

async function initAutoComplete() {
  const { Autocomplete } = await google.maps.importLibrary('places');
  const originAutoComplete = new Autocomplete(startLocationHome, {
    types: ['geocode'],
  });

  const destinationAutoComplete = new Autocomplete(endLocationHome, {
    types: ['geocode'],
  });

  console.log(currentLocation);
  if (currentLocation) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: currentLocation }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          console.log(results[0].address_components[1].long_name);
          // startLocationHome.value = results[0].formatted_address;
          startLocationHome.value = results[0].address_components[1].long_name;
          console.log(results[0].formatted_address);
        }
      }
    });
  }
}

locationBtn.click();
