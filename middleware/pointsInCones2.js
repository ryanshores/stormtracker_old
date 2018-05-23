const turf = require("@turf/turf");

function pointsInCones2(points, cones, callback){
	var newpoints = colorPoints(points, cones);
	callback(null, newpoints);
}

function colorPoints(points, cones){
	points.forEach(function(pt){
		if(pt.coordinates[0] == null){
			pt.coordinates[0] = 0;
		}
		if(pt.coordinates[1] == null){
			pt.coordinates[1] = 0;
		}
		cones.hf64.forEach(function(redLevel){
			if(turf.booleanWithin(turf.point(pt.coordinates), redLevel)){
				pt.color = "red";
			}
		});
		cones.hf50.forEach(function(yellowLevel){
			if(pt.color != "red"){
				if(turf.booleanWithin(turf.point(pt.coordinates),yellowLevel)){
					pt.color = "orange";
				}
			}
		});
		if(pt.color == undefined){
			pt.color = "#3AAD00";
		}
	});
	return points;
}

module.exports = pointsInCones2;