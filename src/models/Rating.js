const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imdbId: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    }
}, { timestamps: true });

ratingSchema.index({ userId: true, imdbId: true }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);