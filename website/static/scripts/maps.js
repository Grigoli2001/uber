let map;
let directionsService;
let directionsRenderer;
const startLocation = document.getElementById('startLocation');
const endLocation = document.getElementById('endLocation');
let location = false;
let currentLocation = false;
const mapDiv = document.getElementById('map');
const loader = document.getElementById('loader');
// Get current location
// navigator.geolocation.getCurrentPosition(
//   (position) => {
//     const { latitude, longitude } = position.coords;
//     console.log(latitude, longitude);
//     console.log(position);
//     location = true;
//     currentLocation = { lat: latitude, lng: longitude };
//     initMap(currentLocation);
//   },
//   (error) => {
//     console.log(error);
//     const centerLocation = { lat: 1.3521, lng: 103.8198 };
//     initMap(centerLocation);
//   }
// );
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
  const form = document.getElementById('directionForm');
  const taxi_container = document.getElementById('taxi_container');
  const sedanPrice = document.getElementById('sedanPrice');
  const vanPrice = document.getElementById('vanPrice');
  const taxiPrice = document.getElementById('taxiPrice');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    taxi_container.style.width = '100%';
    // Example usage (you can call this function where you handle the route response)
    // Get selected car type (this is just a placeholder; you may have a UI element to select car type)
  const selectedCarType = 'SEDAN'; // You can modify this based on user input or some other logic

  // Calculate the price based on the selected car type
  const totalPrice = calculatePrice(
    selectedCarType,
    document.getElementById('distanceNumber').innerHTML,
    document.getElementById('durationNumber').innerHTML
  );
  
  console.log(`Total Price for ${selectedCarType}: ${totalPrice} currency`);
  });
}


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

function calculatePrice(carType,distanceText = document.getElementById('distanceNumber').innerHTML, durationInTrafficText = document.getElementById('durationNumber').innerHTML) {
  // Extract numeric values from distance and duration strings (assuming they are in format like "X km" and "Y mins")
  const distance = parseFloat(distanceText.split(' ')[0]);
  const duration = parseFloat(durationInTrafficText.split(' ')[0]);

  let BASE_FARE, DISTANCE_RATE, TIME_RATE;

  // Set rates based on carType
  switch (carType) {
    case 'SUV':
      BASE_FARE = SUV_BASE_FARE;
      DISTANCE_RATE = SUV_DISTANCE_RATE;
      TIME_RATE = SUV_TIME_RATE;
      break;
    case 'SEDAN':
      BASE_FARE = SEDAN_BASE_FARE;
      DISTANCE_RATE = SEDAN_DISTANCE_RATE;
      TIME_RATE = SEDAN_TIME_RATE;
      break;
    case 'TAXI':
    default:
      BASE_FARE = TAXI_BASE_FARE;
      DISTANCE_RATE = TAXI_DISTANCE_RATE;
      TIME_RATE = TAXI_TIME_RATE;
      break;
  }

  // Calculate price based on distance and time using the rates determined above
  const distanceCost = (distance - 1) * DISTANCE_RATE;
  const timeCost = (duration - 5) * TIME_RATE;

  // Calculate total price
  const totalPrice = BASE_FARE + distanceCost + timeCost;

  return totalPrice.toFixed(2); // Return the total price rounded to 2 decimal places
}


