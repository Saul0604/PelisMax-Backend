const axios = require("axios");

class OmdbService {
    constructor() {
        this.baseURL = "https://www.omdbapi.com";
        this.apiKey = process.env.OMDB_API_KEY;
        console.log("API KEY:", this.apiKey); // ← agrega esto
    }

    async searchMovies(query, page = 1) {
        const { data } = await axios.get(this.baseURL, {
            params: { apikey: this.apiKey, s: query, type: "movie", page },
        });
        if (data.Response === "False") throw new Error(data.Error);
        return data;
    }

    async getMovieById(imdbId) {
        console.log("Llamando a OMDb con:", {
            url: this.baseURL,
            apikey: this.apiKey,
            i: imdbId
        });
        const { data } = await axios.get(this.baseURL, {
            params: { apikey: this.apiKey, i: imdbId, plot: "full" },
        });
        if (data.Response === "False") throw new Error(data.Error);
        return data;
    }

    async getFeatured() {
        const categories = [
            { label: "Acción", query: "action" },
            { label: "Comedia", query: "comedy" },
            { label: "Terror", query: "horror" },
            { label: "Ciencia Ficción", query: "sci-fi" },
        ];

        const results = await Promise.all(
            categories.map(async (cat) => {
                const { data } = await axios.get(this.baseURL, {  // ← destructuring igual que arriba
                    params: { apikey: this.apiKey, s: cat.query, type: "movie" },
                });
                return {
                    category: cat.label,
                    movies: data.Search || [],  // ← ya no necesitas data.data.Search
                };
            })
        );

        return results;
    }
}

module.exports = OmdbService;