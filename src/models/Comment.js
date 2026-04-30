const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movieId: {
        type: String,
        required: true
    },
    movieTitle: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: [true, 'El comentario no puede estar vacío'],
        maxlength: [250, 'El comentario no puede exceder 250 caracteres'],
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
