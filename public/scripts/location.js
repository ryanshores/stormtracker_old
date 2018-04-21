/* globals $, google */

function initSearch() {
    var card = document.getElementById('pac-card');
    var input = document.getElementById('pac-input');
    var form = document.getElementById('form');
    var coordsForm = document.getElementById('coords');
    var options = {
        types: ['(cities)']
    };
    
    var autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.addListener('place_changed', function() {
        let place = autocomplete.getPlace();
        let lat = place.geometry.location.lat();
        let lng = place.geometry.location.lng();
        
        coordsForm.value = [lat, lng];
        
        form.submit();
    });
}