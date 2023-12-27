let map;
let directionsService;
let directionsRenderer;
const startLocation = document.getElementById('startLocation');
const endLocation = document.getElementById('endLocation');
let location = false;
let currentLocation;

// Get current location
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(position);
    location = true;
    currentLocation = { lat: latitude, lng: longitude };
    initMap(currentLocation);
  },
  (error) => {
    console.log(error);
    const centerLocation = { lat: 1.3521, lng: 103.8198 };
    initMap(centerLocation);
  }
);

async function initMap(centerLocation) {
  const { Map } = await google.maps.importLibrary('maps');
  const { Autocomplete } = await google.maps.importLibrary('places');
  const { Marker } = await google.maps.importLibrary('marker');
  const { DirectionsService } = await google.maps.importLibrary('routes');
  const { DirectionsRenderer } = await google.maps.importLibrary('routes');
  const startMarker = {
    // url: '/static/assets/startMarker.png',
    scaledSize: new google.maps.Size(30, 30),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(25, 50),
  };
  const endMarker = {
    // url: '/static/assets/endMarker.png',
    scaledSize: new google.maps.Size(30, 30),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(25, 50),
  };

  map = new Map(document.getElementById('map'), {
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
          console.log(results[0].formatted_address);
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

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    draggable: false,
    suppressMarkers: true,
  });

  const originAutoComplete = new Autocomplete(startLocation, {
    types: ['geocode'],
  });

  const destinationAutoComplete = new Autocomplete(endLocation, {
    types: ['geocode'],
  });

  let originMarker;
  let destinationMarker;
  // google.maps.event.addListener(map, 'zoom_changed', function () {
  //   adjustMarkerSizes();
  // });

  // function adjustMarkerSizes() {
  //   const currentZoom = map.getZoom();
  //   const scaleFactor = currentZoom / 10;

  //   // Calculate adjusted anchor points based on the scale factor
  //   const adjustedAnchorX = 25 * scaleFactor;
  //   const adjustedAnchorY = 50 * scaleFactor;

  //   if (originMarker) {
  //     originMarker.setIcon({
  //       url: '/static/assets/startMarker.png',
  //       scaledSize: new google.maps.Size(30 * scaleFactor, 30 * scaleFactor),
  //       origin: new google.maps.Point(0, 0), // Keep origin point as (0, 0)
  //       anchor: new google.maps.Point(adjustedAnchorX, adjustedAnchorY), // Adjust anchor point
  //     });
  //   }

  //   if (destinationMarker) {
  //     destinationMarker.setIcon({
  //       url: '/static/assets/endMarker.png',
  //       scaledSize: new google.maps.Size(30 * scaleFactor, 30 * scaleFactor),
  //       origin: new google.maps.Point(0, 0), // Keep origin point as (0, 0)
  //       anchor: new google.maps.Point(adjustedAnchorX, adjustedAnchorY), // Adjust anchor point
  //     });
  //   }
  // }

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
        icon: marker,
        label: {
          text: 'A',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      });
    }

    if (type === 'destination') {
      if (destinationMarker) {
        destinationMarker.setMap(null);
      }
      destinationMarker = new Marker({
        position: place.geometry.location,
        map,
        title: place.name,
        icon: marker,
        label: {
          text: 'B',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
        },
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
          document.getElementById('distance').innerHTML = distance.text;
          document.getElementById('duration').innerHTML =
            duration_in_traffic.text;
          directionsRenderer.setOptions({
            directions: response,
            draggable: false,
            map,
            polylineOptions: {
              strokeColor: '#000000', // Set the color of the route line
              strokeOpacity: 0.8, // Set the opacity of the route line
              strokeWeight: 4, // Set the thickness of the route line to 4
            },
            surpressMarkers: true,
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
          window.alert('Directions request failed due to ' + status);
        }
      }
    );
  }
}
