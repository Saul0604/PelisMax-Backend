const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'El nombre de la lista es obligatorio'],
        maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
        trim: true
    },
    movies: [{
        type: String,
        ref: 'Movie'
    }]
}, { timestamps: true });

// Asegurar que el mismo usuario no tenga dos listas con el mismo nombre
listSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('List', listSchema);
