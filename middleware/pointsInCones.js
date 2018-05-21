const turf = require("@turf/turf");

function pointsInCones(points, storms, callback){
	var cones = makeCones(storms);
	var newpoints = colorPoints(points, cones);
	callback(null, cones, newpoints);
}

function makeCones(storms){
	var cones = {
        f50: [],
        f64: [],
        hf50: [],
        hf64: []
    };
    storms.forEach(function(storm){
        if(storm.json.toObject().type == "FeatureCollection"){
            var features = storm.json.toObject().features;
            features.forEach(function(feature){
                if(feature.properties.name == "f50"){
                    cones.f50.push(feature);
                } else if(feature.properties.name == "f64"){
                    cones.f64.push(feature);
                } else if(feature.properties.name == "hf50"){
                    cones.hf50.push(feature);
                } else if(feature.properties.name == "hf64"){
                    cones.hf64.push(feature);
                }
            });
        }
    });
    return cones;
}

function colorPoints(points, cones){
	points.forEach(function(pt){
		cones.hf64.forEach(function(redLevel){
			if(turf.booleanWithin(turf.point(pt.geometry.coordinates), redLevel)){
				pt.properties.color = "red";
			}
		});
		cones.hf50.forEach(function(yellowLevel){
			if(pt.properties.color != "red"){
				if(turf.booleanWithin(turf.point(pt.geometry.coordinates),yellowLevel)){
					pt.properties.color = "orange";
				}
			}
		});
		if(pt.properties.color == undefined){
			pt.properties.color = "#3AAD00";
		}
	});
	return points;
}

module.exports = pointsInCones;