const Review = require('../models/Review');
const Movie = require('../models/Movie');

class ReviewService {
    /**
     * Obtiene las reseñas del usuario autenticado
     */
    async getUserReviews(userId) {
        return await Review.find({ userId })
            .populate('movieId') 
            .sort({ createdAt: -1 });
    }

    /**
     * Obtiene todas las reseñas de una película específica
     */
    async getMovieReviews(movieId) {
        return await Review.find({ movieId })
            .populate('userId', 'name') // Traer el nombre del usuario que hizo la reseña
            .sort({ createdAt: -1 });
    }

    /**
     * Crea una nueva reseña, asegurando que la película exista en la BD
     */
    async createReview(userId, reviewData) {
        const { movieId, movieTitle, moviePoster, movieYear, content, rating } = reviewData;

        // Asegurar que la película esté registrada para el populate
        await Movie.findByIdAndUpdate(
            movieId,
            { 
                title: movieTitle, 
                poster: moviePoster, 
                releaseYear: movieYear 
            },
            { upsert: true, new: true }
        );

        const newReview = new Review({
            userId,
            movieId,
            content,
            rating
        });

        await newReview.save();
        return newReview;
    }

    /**
     * Actualiza una reseña (PATCH)
     */
    async updateReview(reviewId, userId, updateData) {
        const review = await Review.findById(reviewId);
        
        if (!review) {
            throw new Error("Reseña no encontrada");
        }

        // Verificar propiedad
        if (review.userId.toString() !== userId) {
            throw new Error("No tienes permiso para editar esta reseña");
        }

        // Actualizar solo campos permitidos
        if (updateData.content) review.content = updateData.content;
        if (updateData.rating) review.rating = updateData.rating;

        await review.save();
        return review;
    }

    /**
     * Elimina una reseña
     */
    async deleteReview(reviewId, userId) {
        const review = await Review.findById(reviewId);

        if (!review) {
            throw new Error("Reseña no encontrada");
        }

        // Verificar propiedad
        if (review.userId.toString() !== userId) {
            throw new Error("No tienes permiso para eliminar esta reseña");
        }

        await Review.findByIdAndDelete(reviewId);
        return { message: "Reseña eliminada con éxito" };
    }
}

module.exports = ReviewService;
