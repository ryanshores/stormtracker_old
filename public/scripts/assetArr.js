/* globals $ */

$('#addSites').on('click', function() {
   var array = makeArray();
   $.post('/newsites/add', {array: array});
   window.location.href = '/home';
});

$('.removeBtn').on('click', function(){
   $(this).parent().remove();
});

function makeArray() {
   var assetArr = [];
   var groups = $('.group');
   var groupLen = groups.length;
   for (var i = 1; i <= groupLen; i++) {
      var obj = {};
      var inputs = $('.group:nth-of-type(' + i + ') > .input-group > .input');
      $.each(inputs, function(i,o){
         obj[$(this).attr('name')] = $(this).val();
      });
      assetArr.push(obj);
   }
   return assetArr;
}