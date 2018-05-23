var mongoose = require('mongoose');

var cardSchema = new mongoose.Schema({
    
    title: String,
    desc: String,
    url: String,
    isActive: Boolean,
    
    storm: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Storm"
        },
        stormName: String
    }
    
});

module.exports = mongoose.model('Card', cardSchema);