/* global $ */


$( window ).on('load', function() {
  $('.loader').fadeOut();
  $('.alert').delay(3000).fadeOut();
});

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});

$('.close').on('click', function(){
  $('.alert').hide();
});


