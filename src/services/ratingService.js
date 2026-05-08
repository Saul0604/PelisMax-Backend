const Rating = require("../models/Rating");

class RatingService {

    // Crear o actualizar calificación (Upsert)
    async rateMovie(userId, imdbId, score) {
        if (!score || score < 1 || score > 5) {
            throw new Error("El score debe ser entre 1 y 5");
        }

        const rating = await Rating.findOneAndUpdate(
            { userId, imdbId },        // busca por usuario + película
            { score },                  // actualiza el score
            { upsert: true, new: true } // si no existe lo crea, devuelve el nuevo
        );

        return rating;
    }

    // Obtener promedio y total de votos de una película
    async getMovieStats(imdbId) {
        const stats = await Rating.aggregate([
            { $match: { imdbId } },
            {
                $group: {
                    _id: "$imdbId",
                    averageScore: { $avg: "$score" },
                    totalVotes: { $sum: 1 },
                },
            },
        ]);

        if (stats.length === 0) {
            return { averageScore: null, totalVotes: 0 };
        }

        return {
            averageScore: parseFloat(stats[0].averageScore.toFixed(1)),
            totalVotes: stats[0].totalVotes,
        };
    }

    // Obtener la calificación del usuario para una película
    async getUserRating(userId, imdbId) {
        const rating = await Rating.findOne({ userId, imdbId });
        return rating ? rating.score : null;
    }
}

module.exports = RatingService;