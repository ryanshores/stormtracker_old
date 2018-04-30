/* globals $ */

// $('#addSites').on('click', function() {
//    var array = makeArray();
//    $.post('/newsites/add', {array: array});
//    window.location.href = '/home';
// });

$('.removeBtn').on('click', function(){
   $(this).parent().remove();
});

$('.addBtn').on('click', function(){
   var form = $(this).parent();
   console.log(form);
   var inputs = form.children('.input-group');
   console.log(inputs);
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
   console.log(asset);
});

// function makeArray() {
//    var assetArr = [];
//    var groups = $('.group');
//    var groupLen = groups.length;
//    for (var i = 1; i <= groupLen; i++) {
//       var obj = {};
//       var inputs = $('.group:nth-of-type(' + i + ') > .input-group > .input');
//       $.each(inputs, function(i,o){
//          obj[$(this).attr('name')] = $(this).val();
//       });
//       assetArr.push(obj);
//    }
//    return assetArr;
// }

function submitData(obj){
   obj.preventDefault();
   var form = obj.parent();
   console.log(form);
   // var asset = {
   //    geometry: {
   //       coordinates: [ lng, lat ]
   //    },
   //    properties: {
   //       name: {type: String, default: ''},
   //       group: {type: String, default: ''},
   //       type: {type: String, default: ''},
   //       airGap: {type: Number, default: 0},
   //       areaCode: {type: String, default: ''},
   // 	   blockNumber: {type: Number, default: 0},
   //       field: {type: String, default: ''},
   // 		waterDepth: {type: Number, default: 0},
   // 		workingInt: {type: Number, default: 0},
   // 		pd: {type: Number, default: 0},
   // 		rod: {type: Number, default: 0},
   // 		sl: {type: Number, default: 0},
   // 		oee: {type: Number, default: 0},
   // 		lopi: {type: Number, default: 0},
   // 		windstormCSL: {type: Number, default: 0},
   // 		windstormRet: {type: Number, default: 0}
   //    }
   // }
   
   return false;
}