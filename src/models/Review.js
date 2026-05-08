const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: String,
        ref: 'Movie',
        required: true
    },
    content: {
        type: String,
        required: [true, 'La reseña no puede estar vacía'],
        maxlength: [500, 'La reseña no puede exceder 500 caracteres'],
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Formatear la fecha para el frontend (ej. "25 Dic 2025")
reviewSchema.virtual('formattedDate').get(function() {
    if (!this.createdAt) return "";
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const dateStr = this.createdAt.toLocaleDateString('es-ES', options);
    // Capitalizar la primera letra del mes si es necesario
    return dateStr.replace(/^(\d{2}) (\w{3}) (\d{4})$/, (match, d, m, y) => {
        return `${d} ${m.charAt(0).toUpperCase() + m.slice(1)} ${y}`;
    });
});

module.exports = mongoose.model('Review', reviewSchema);
