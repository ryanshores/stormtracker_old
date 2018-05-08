var mongoose = require('mongoose');


// storms inputed from easy site
var stormSchema = new mongoose.Schema({
    
    name: String,
    category: Number,
    isActive: Boolean,
    
    cards: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card"
        }
    ]
    
});

module.exports = mongoose.model('Storm', stormSchema);