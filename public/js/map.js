console.log(longitude, latitude);

var map = L.map("map").setView([latitude, latitude], 9); // [lat, lng], zoom

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Create a marker at your location
L.marker([latitude, longitude])
  .addTo(map)
  .bindPopup("Your Location")
  .openPopup();
