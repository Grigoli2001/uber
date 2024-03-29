let map;
let directionsService;
let directionsRenderer;
const startLocation = document.getElementById('startLocation');
const endLocation = document.getElementById('endLocation');
let location = false;
let currentLocation = false;
const mapDiv = document.getElementById('map');
const loader = document.getElementById('loader');
const taxies = document.getElementsByClassName('taxies');
const requestRideForm = document.getElementById('requestRideForm');
const requestBtn = document.getElementById('requestRideBtn');
const cancelBtn = document.getElementById('cancelRideBtn');
const statusH4 = document.getElementById('statusH4')
const statusSpan = document.getElementById('status');
const form = document.getElementById('directionForm');
const taxi_container = document.getElementById('taxi_container');
const sedanPrice = document.getElementById('sedanPrice');
const vanPrice = document.getElementById('vanPrice');
const taxiPrice = document.getElementById('taxiPrice');
const submitBtn = document.getElementById('submitBtn');
const pendingHtml = function(){

  requestBtn.style.display = 'none'
  cancelBtn.style.display = 'flex'
  statusH4.style.display = 'flex'
  statusSpan.innerHTML = "Pending"
  submitBtn.click()

}

const cancelHtml = function(){
  requestBtn.style.display = 'block'
  cancelBtn.style.display = 'none'
  statusH4.style.display = 'none'
  statusSpan.innerHTML = ""
  window.location.reload();

}
function handleTaxiClick(event) {
  // First, remove the 'selected' class from all taxies
  for (let j = 0; j < taxies.length; j++) {
    taxies[j].classList.remove('selected');
  }
  
  // Determine which taxi was clicked and add the 'selected' class to it
  for (let i = 0; i < taxies.length; i++) {
    if (taxies[i] === event.target) {
      taxies[i].classList.add('selected');
      break; // Exit the loop once the clicked taxi is found and class is added
    }
  }
}
for (let i = 0; i < taxies.length; i++) {
  taxies[i].addEventListener('click', handleTaxiClick);
}

// check if user has already submitted a request
async function checkRequest(route) {
  const res = await fetch('/ride/request/status', {
    method: 'GET',
    credentials: 'include',
  });
  const resData = await res.json();
  console.log(resData);
  if (resData.status === 'accepted') {
    window.location.href = '/dashboard';
  }
  else if (resData.status === 'pending'){
    alert("You have a pending request")
    startLocation.value = resData.pickup;
    endLocation.value = resData.destination;
    for (let i = 0; i < taxies.length; i++) {
      taxies[i].removeEventListener('click', handleTaxiClick);
    }
    route(
      { geometry: { location: startLocation.value } },
      { geometry: { location: endLocation.value } }
    );
    setTimeout(() => {
      pendingHtml() 
    }
    , 500);
    const checkStatusInterval = setInterval(async () => {
      const checkRes = await fetch('/ride/request/status', {
        method: 'GET',
        credentials: 'include',
      });

      const checkResData = await checkRes.json();
      console.log(checkResData);

      if (checkResData.status === 'accepted') {
        clearInterval(checkStatusInterval); // Stop polling
        window.location.href = '/dashboard'; // Redirect to dashboard or handle accordingly
      }
    }, 5000);
  
  }
}

const centerLocation = { lat: 1.3521, lng: 103.8198 };
initMap(centerLocation);

async function initMap(centerLocation) {
  const { Map } = await google.maps.importLibrary('maps');
  const { Autocomplete } = await google.maps.importLibrary('places');
  const { Marker } = await google.maps.importLibrary('marker');
  const { DirectionsService } = await google.maps.importLibrary('routes');
  const { DirectionsRenderer } = await google.maps.importLibrary('routes');
  const startMarker = {
    // url: '/static/assets/startMarker.png',
    // scaledSize: new google.maps.Size(30, 30),
    // origin: new google.maps.Point(0, 0),
    // anchor: new google.maps.Point(25, 50),
  };
  const endMarker = {
    // url: '/static/assets/endMarker.png',
    // scaledSize: new google.maps.Size(30, 30),
    // origin: new google.maps.Point(0, 0),
    // anchor: new google.maps.Point(25, 50),
  };

  map = new Map(mapDiv, {
    center: centerLocation, // Example center point
    zoom: 12,
    maxZoom: 20,
    minZoom: 3,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    // zoomControl: false,
    gestureHandling: 'greedy',
    mapTypeId: 'roadmap',
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        stylers: [{ visibility: 'off' }],
      },
    ],
  });

  let currentMarker;
  if (currentLocation) {
    // currentMarker = new Marker({
    //   position: currentLocation,
    //   map,
    //   title: 'Current Location',
    //   label: {
    //     text: 'C',
    //     color: '#ffffff',
    //     fontSize: '14px',
    //     fontWeight: 'bold',
    //   },
    // });
    let current = new google.maps.LatLng(
      currentLocation.lat,
      currentLocation.lng
    );
    map.setCenter(current);
    map.setZoom(15);
    // currentLocation street name;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: current }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          startLocation.value = results[0].formatted_address;
          startLocation.focus();
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }
  google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
    loader.style.display = 'none';
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    draggable: false,
    suppressMarkers: false,
  });
  checkRequest(route);

  const originAutoComplete = new Autocomplete(startLocation, {
    types: ['geocode'],
  });

  const destinationAutoComplete = new Autocomplete(endLocation, {
    types: ['geocode'],
  });

  let originMarker;
  let destinationMarker;

  originAutoComplete.addListener('place_changed', () => {
    const originPlace = originAutoComplete.getPlace();
    handlePlaceChange(originPlace, 'origin', startMarker);
  });

  destinationAutoComplete.addListener('place_changed', () => {
    const destinationPlace = destinationAutoComplete.getPlace();
    handlePlaceChange(destinationPlace, 'destination', endMarker);
  });

  function handlePlaceChange(place, type, marker) {
    if (!place.geometry) {
      window.alert('No details available for input: ' + place.name);
      return;
    }

    if (type === 'origin') {
      if (originMarker) {
        originMarker.setMap(null);
      }
      originMarker = new Marker({
        position: place.geometry.location,
        map,
        title: place.name,
        // icon: marker,
      });

      map.setCenter(place.geometry.location);
    }

    if (type === 'destination') {
      if (destinationMarker) {
        destinationMarker.setMap(null);
      }
      destinationMarker = new Marker({
        position: place.geometry.location,
        map,
        title: place.name,
        // icon: marker,
      });
    }

    route(originAutoComplete.getPlace(), destinationAutoComplete.getPlace());
  }
  const now = new Date();

  function route(originPlace, destinationPlace) {
    if (!originPlace.geometry || !destinationPlace.geometry) {
      return;
    }

    directionsService.route(
      {
        origin: originPlace.geometry.location,
        destination: destinationPlace.geometry.location,
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime: now,
          trafficModel: 'pessimistic',
        },
      },
      (response, status) => {
        if (status === 'OK') {
          console.log(response);
          console.log(response.routes[0].legs[0]);
          const { distance, duration, duration_in_traffic } =
            response.routes[0].legs[0];
          document.getElementById('distance').innerHTML =
            'Distance: <span id="distanceNumber">' + distance.text + '</span>';
          document.getElementById('duration').innerHTML =
            'Trip will take approximately: <span id="durationNumber">' + duration_in_traffic.text + '</span>';
          directionsRenderer.setOptions({
            directions: response,
            draggable: false,
            map,
            polylineOptions: {
              strokeColor: '#000000', // Set the color of the route line
              strokeOpacity: 0.8, // Set the opacity of the route line
              strokeWeight: 4, // Set the thickness of the route line to 4
            },
            surpressMarkers: false,
          });

          // if (originMarker) {
          //   originMarker.setMap(null);
          // }
          // if (destinationMarker) {
          //   destinationMarker.setMap(null);
          // }

          // originMarker = new Marker({
          //   position: originPlace.geometry.location,
          //   map,
          //   title: originPlace.name,
          // });

          // destinationMarker = new Marker({
          //   position: destinationPlace.geometry.location,
          //   map,
          //   title: destinationPlace.name,
          // });
        } else {
          window.alert(
            'Directions request failed due to ' +
              status +
              originPlace.geometry.location +
              destinationPlace.geometry.location
          );
        }
      }
    );
  }
  try {
    if (pickup && destination) {
      console.log("I'm here");
      startLocation.value = pickup;
      endLocation.value = destination;

      originMarker = new Marker({
        position: pickup,
        map,
        title: 'Pickup Location',
        // icon: marker,
      });

      destinationMarker = new Marker({
        position: destination,
        map,
        title: 'Destination',
        // icon: marker,
      });

      route(
        { geometry: { location: startLocation.value } },
        { geometry: { location: endLocation.value } }
      );
    }
  } catch (err) {
    console.log(err);
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    taxi_container.style.width = '0%';
    loader.style.display = 'flex';
    setTimeout(() => {
      taxi_container.style.width = '100%';
    }
    , 1000);
    loader.style.display = 'none';
      

  // Calculate the price
  const totalPrice = calculatePrice(
    document.getElementById('distanceNumber').innerHTML,
    document.getElementById('durationNumber').innerHTML
  );
  const taxies = document.getElementsByClassName('taxies');
  for (let i = 0; i < taxies.length; i++) {
    taxies[i].setAttribute('data-price', totalPrice[taxies[i].getAttribute('data-type')]);
  }
  sedanPrice.innerHTML = totalPrice['Sedan'];
  vanPrice.innerHTML = totalPrice['SUV'];
  taxiPrice.innerHTML = totalPrice['Taxi'];
  
  });

  // const requestRideForm = document.getElementById('requestRideForm');

  requestRideForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedTaxi = document.querySelector('.taxies.selected');
    const taxiType = selectedTaxi.getAttribute('data-type');
    const taxiPrice = selectedTaxi.getAttribute('data-price');
    console.log(taxiType, taxiPrice);
    const distance = document.getElementById('distanceNumber').innerHTML;
    const duration = document.getElementById('durationNumber').innerHTML;
    const startLocation = document.getElementById('startLocation').value;
    const endLocation = document.getElementById('endLocation').value;
    const data = {
      taxiType,
      taxiPrice,
      distance,
      duration,
      startLocation,
      endLocation,
    };
    console.log(data);
    const res = await fetch('/ride/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const resData = await res.json();
    console.log(resData);

    if (resData.status === 'pending') {

      pendingHtml()

      const checkStatusInterval = setInterval(async () => {
        const checkRes = await fetch('/ride/request/status', {
          method: 'GET',
          credentials: 'include',
        });

        const checkResData = await checkRes.json();
        console.log(checkResData);

        if (checkResData.status === 'accepted') {
          clearInterval(checkStatusInterval); // Stop polling
          window.location.href = '/dashboard'; // Redirect to dashboard or handle accordingly
        }
      }, 5000);
    }
    else if (resData.status === 'error'){
      console.log(resData.message);
      window.alert(resData.message);
    }
  }
)};

const cancelRideForm = document.getElementById('cancelRideForm');
cancelRideForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!confirm('Are you sure you want to cancel the ride?')) {
    return;
  }
  const res = await fetch('/ride/request/cancel', {
    method: 'GET',
    credentials: 'include',
  });
  const resData = await res.json();
  console.log(resData);
  if (resData.status === 'success') {
    alert(resData.message);
    cancelHtml()
  }
});


// Prices for each car type
const SUV_BASE_FARE = 10; // Base fare for SUV in some currency
const SUV_DISTANCE_RATE = 3; // Cost per kilometer for SUV in some currency
const SUV_TIME_RATE = 2; // Cost per minute for SUV in some currency

const SEDAN_BASE_FARE = 7; // Base fare for Sedan in some currency
const SEDAN_DISTANCE_RATE = 2.5; // Cost per kilometer for Sedan in some currency
const SEDAN_TIME_RATE = 1.5; // Cost per minute for Sedan in some currency

const TAXI_BASE_FARE = 5; // Base fare for Taxi in some currency
const TAXI_DISTANCE_RATE = 2; // Cost per kilometer for Taxi in some currency
const TAXI_TIME_RATE = 1; // Cost per minute for Taxi in some currency

function calculatePrice(distanceText , durationInTrafficText) {

  // Get the distance in km
  const distance = parseFloat(distanceText.split(' ')[0]);

  // Get the duration in minutes
  const durationInTraffic = parseFloat(durationInTrafficText.split(' ')[0]);

  // Calculate the price
  let totalPrice = {'SUV': 0, 'Sedan': 0, 'Taxi': 0};

  // Calculate the price for SUV
  totalPrice['SUV'] = SUV_BASE_FARE + (distance * SUV_DISTANCE_RATE) + (durationInTraffic * SUV_TIME_RATE);

  // Calculate the price for Sedan
  totalPrice['Sedan'] = SEDAN_BASE_FARE + (distance * SEDAN_DISTANCE_RATE) + (durationInTraffic * SEDAN_TIME_RATE);

  // Calculate the price for Taxi
  totalPrice['Taxi'] = TAXI_BASE_FARE + (distance * TAXI_DISTANCE_RATE) + (durationInTraffic * TAXI_TIME_RATE);
  return totalPrice;

}

