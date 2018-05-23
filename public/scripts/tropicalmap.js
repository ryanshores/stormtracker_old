/* global google, cones, storms, sites, MarkerClusterer, allSites */

var map;
var map2;

function initMap() {

  // setup the map of all storms
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: new google.maps.LatLng(21.5, -70),
    mapTypeId: 'satellite'
  });
  
  map2 = new google.maps.Map(document.getElementById('map2'), {
    zoom: 4,
    center: new google.maps.LatLng(21.5, -70),
    mapTypeId: 'satellite'
  });
  
  // Users asset map
  addLayers(cones, map);
  addStorms(storms, map);
  var markers = addSites(sites, map);
  
  // Public Map
  addLayers(cones, map2);
  addStorms(storms, map2);
  var publicMarkers = publicSites(allSites);
  
  // Add a marker clusterer to manage the markers.
  var mcOptions = {
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    gridSize: 50,
    maxZoom: 5
  };
  var markerCluster = new MarkerClusterer( map, markers, mcOptions );
  var markerCluster = new MarkerClusterer( map2, publicMarkers, mcOptions );

}

function circle(color){
	var circle = {
	    path: google.maps.SymbolPath.CIRCLE,
	    fillColor: color,
	    fillOpacity: .4,
	    scale: 4.5,
	    strokeColor: color,
	    strokeOpacity: 0.8,
	    strokeWeight: 1	
	};
	return circle;
}

function addLayers(cones, map){
  cones.f50.forEach(function(cone){
    map.data.addGeoJson(cone);
  });
  cones.f64.forEach(function(cone){
    map.data.addGeoJson(cone);
  })
  map.data.setStyle(function(feature) {
		    return {
		      fillColor: feature.getProperty('fill'),
		      fillOpacity: feature.getProperty('fill-opacity') * 0.5,
		      strokeColor: feature.getProperty('stroke'),
		      strokeOpacity: feature.getProperty('stroke-opacity'),
		      strokeWeight: 1
		    };
	});	
}

function addStorms(storms, map){
  storms.forEach(function(storm){
    var contentWindow =
      '<p>Name: ' + storm.name + '</p>' +
      '<p>Category: ' + storm.category + '</p>' + 
      '<p>Coordinates: ' + storm.lat + ', ' + storm.lng + '</p>' +
      '<p>Speed: ' + storm.fspeed + '</p>' +
      '<p>Direction: ' + storm.direction + '</p>';
    var infoWindow = new google.maps.InfoWindow({
        content: contentWindow
    });
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(storm.lat, storm.lng),
        map: map,
        title: "Storm",
        icon: '/icons/cat' + storm.category + '.png'
    });  
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    google.maps.event.addListener(map, "click", function(event) {
      infoWindow.close();
    });
    
    // add forecasts to map
    storm['Forecast'].forEach(function(forecast){
      var contentWindow =
        '<p>Name: ' + storm.name + '</p>' +
        '<p>Hour: ' + forecast.hour + '</p>' + 
        '<p>Category: ' + forecast.category + '</p>' + 
        '<p>Coordinates: ' + forecast.lat + ', ' + forecast.lng + '</p>';
      var infoWindow = new google.maps.InfoWindow({
          content: contentWindow
      });
      var marker = new google.maps.Marker({
          position: new google.maps.LatLng(forecast.lat, forecast.lng),
          map: map,
          title: "Storm",
          icon: "/icons/cat" + forecast.category + ".png"
      });  
      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
      google.maps.event.addListener(map, "click", function(event) {
        infoWindow.close();
      });
    });
  });
}

function addSites(sites, map){
  var markers = [];
  sites.forEach(function(site){
    var contentWindow = site.properties.name;
    var infoWindow = new google.maps.InfoWindow({
        content: contentWindow
    });
    var coords = new google.maps.LatLng(site.geometry.coordinates[1], site.geometry.coordinates[0]);
    var marker = new google.maps.Marker({
        position: coords,
        icon: circle(site.properties.color)
    });
    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    });
    google.maps.event.addListener(map, "click", function(event) {
      infoWindow.close();
    });
    markers.push(marker);
  });
  return markers;
}

function publicSites(sites){
  var markers = [];
  sites.forEach(function(site){
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(site.coordinates[1], site.coordinates[0]),
      icon: circle(site.color)
    });
    markers.push(marker);
  });
  return markers;
}