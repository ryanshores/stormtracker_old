var mongoose = require("mongoose");

// SCHEMA SETUP
var siteSchema = new mongoose.Schema({

    type: {type: String, default: 'Feature'},
    geometry: {
        // It's important to define type within type field, because
        // mongoose use "type" to identify field's object type.
        type: {type: String, default: 'Point'},
        // Default value is needed. Mongoose pass an empty array to
        // array type by default, but it will fail MongoDB's pre-save
        // validation.
        coordinates: {type: [Number], default: [0, 0]}
    },
    properties: {
        name: {type: String, default: ''},
        group: {type: String, default: ''},
        type: {type: String, default: ''},
        airgap: {type: Number, default: 0},
        areaCode: {type: String, default: ''},
		blockNumber: {type: Number, default: 0},
		field: {type: String, default: ''},
		waterDepth: {type: Number, default: 0},
		workingInt: {type: Number, default: 0},
		pd: {type: Number, default: 0},
		rod: {type: Number, default: 0},
		sl: {type: Number, default: 0},
		oee: {type: Number, default: 0},
		lopi: {type: Number, default: 0},
		windstormCSL: {type: Number, default: 0},
		windstormRet: {type: Number, default: 0}
    }
});

module.exports = mongoose.model("Site", siteSchema);