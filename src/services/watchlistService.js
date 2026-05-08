const Watchlist = require('../models/Watchlist');

class WatchlistService {
    async getWatchlist(userId) {
        const watchlist = await Watchlist.find({ userId }).select('movieId posterPath');
        return watchlist.map(item => ({
            id: item.movieId,
            poster: item.posterPath
        }));
    }

    async addToWatchlist(userId, movieId, posterPath) {
        if (!movieId || !posterPath) {
            throw new Error("movieId y posterPath son obligatorios");
        }

        const newEntry = new Watchlist({ userId, movieId, posterPath });
        await newEntry.save();
        return newEntry;
    }

    async markAsWatched(userId, movieId) {
        const result = await Watchlist.findOneAndDelete({ userId, movieId });
        if (!result) {
            throw new Error("La película no estaba en la watchlist");
        }
        return { message: "Película eliminada de la watchlist con éxito" };
    }
}

module.exports = WatchlistService;
