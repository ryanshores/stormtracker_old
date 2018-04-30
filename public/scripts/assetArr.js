/* globals $ */

$('.removeBtn').on('click', function(){
   $(this).parent().remove();
});

$('.addBtn').on('click', function(){
   var form = $(this).parent();
   var inputEl = form.children('.input-group').children('.input');
   inputEl.prop('disabled', true);
   var inputs = form.children('.input-group');
   var asset = {
      geometry: {
         coordinates: [ inputs.children('.lng').val(), inputs.children('.lat').val() ]
      },
      properties: {
         name: inputs.children('.name').val(),
         type: inputs.children('.type').val(),
         airGap: inputs.children('.airGap').val(),
         areaCode: inputs.children('.areaCode').val(),
   	   blockNumber: inputs.children('.blockNumber').val(),
         field: inputs.children('.field').val(),
   		waterDepth: inputs.children('.waterDepth').val(),
   		workingInt: inputs.children('.workingInt').val(),
   		pd: inputs.children('.pd').val(),
   		rod: inputs.children('.rod').val(),
   		sl: inputs.children('.sl').val(),
   		oee: inputs.children('.oee').val(),
   		lopi: inputs.children('.lopi').val(),
   		windstormCSL: inputs.children('.windstormCSL').val(),
   		windstormRet: inputs.children('.windstormRet').val()
      }
   };
   $.post('/newsites/add', {asset: asset}, function(){
      alert('Successfully added asset to database');
   })
      .done(function(){
         form.remove();
      })
      .fail(function(){
         inputEl.prop('disabled', false);
      });
});