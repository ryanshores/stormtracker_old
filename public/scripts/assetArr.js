/* globals $ */

// $('#addSites').on('click', function() {
//    var array = makeArray();
//    $.post('/newsites/add', {array: array});
//    window.location.href = '/home';
// });

$('.removeBtn').on('click', function(){
   $(this).parent().remove();
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