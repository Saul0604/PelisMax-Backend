const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true 
    }, // Usaremos el imdbID como _id
    title: { 
        type: String, 
        required: true 
    },
    poster: { 
        type: String, 
        required: true 
    },
    releaseYear: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
