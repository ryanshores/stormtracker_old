/* global google */

var map;
var infoWindow;
function initMap() {
  
  // setup the map of all storms
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 2,
    center: new google.maps.LatLng(16, 8.5),
    mapTypeId: 'terrain'
  });
  
  google.maps.event.addListener(map, "click", function(event) {
    infoWindow.close();
  });
  
  var coneLayer = new google.maps.KmlLayer({
    url: 'https://www.nhc.noaa.gov/gis/examples/AL112017_020adv_CONE.kmz',
    // href: '/kmz/al112017_020adv_CONE.kml',
    map: map
  });
      
  var trekLayer = new google.maps.KmlLayer({
    url: 'https://www.nhc.noaa.gov/gis/examples/AL112017_020adv_TRACK.kmz',
    map: map
  });
  
  // add all storm information to storm map
  storms.forEach(function(storm){
    var contentWindow =
      '<p>Name: ' + storm.name + '</p>' +
      '<p>Category: ' + storm.category + '</p>' + 
      '<p>Coordinates: ' + storm.lat + ', ' + storm.lng + '</p>' +
      '<p>Speed: ' + storm.fspeed + '</p>' +
      '<p>Direction: ' + storm.direction + '</p>';
    infoWindow = new google.maps.InfoWindow({
        content: contentWindow
    });
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(storm.lat, storm.lng),
        map: map,
        title: "Storm",
        icon: "/images/hurricane-small.png"
    });  
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    
    storm['Forecast'].forEach(function(forecast){
      var contentWindow =
        '<p>Name: ' + storm.name + '</p>' +
        '<p>Hour: ' + forecast.hour + '</p>' + 
        '<p>Category: ' + forecast.category + '</p>' + 
        '<p>Coordinates: ' + forecast.lat + ', ' + forecast.lng + '</p>';
      infoWindow = new google.maps.InfoWindow({
          content: contentWindow
      });
      var marker = new google.maps.Marker({
          position: new google.maps.LatLng(forecast.lat, forecast.lng),
          map: map,
          title: "Storm",
          icon: "/images/hurricane-small.png"
      });  
      marker.addListener('click', function() {
          infoWindow.open(map, marker);
      });
    });
    
  });
  
  // if server sends sites, put them on the map
  if ( sites.length > 0 ) {
    
    sites.forEach(function(site){
      var contentWindow = site.properties.name;
      var infoWindow = new google.maps.InfoWindow({
          content: contentWindow
      });
      var marker = new google.maps.Marker({
          position: new google.maps.LatLng(site.geometry.coordinates[1], site.geometry.coordinates[0]),
          map: map,
          title: "Place: " + site.properties.name
      });
      marker.addListener('click', function() {
          infoWindow.open(map, marker);
      });
    });
  };

}; 

function initLayers() {
  var coneLayer = new google.maps.KmlLayer({
    url: 'https://www.nhc.noaa.gov/gis/examples/AL112017_020adv_CONE.kmz',
    // href: '/kmz/al112017_020adv_CONE.kml',
    map: map
  });
      
  var trekLayer = new google.maps.KmlLayer({
    url: 'https://www.nhc.noaa.gov/gis/examples/AL112017_020adv_TRACK.kmz',
    map: map
  });
};