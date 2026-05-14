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

    async getFeatured(page = 1) {
        const currentYear = new Date().getFullYear();
        const categories = [
            { label: "Estrenos", query: "2025", isYear: true }, // Use a year-based query
            { label: "Acción", query: "action" },
            { label: "Comedia", query: "comedy" },
            { label: "Terror", query: "horror" },
            { label: "Ciencia Ficción", query: "sci-fi" },
            { label: "Drama", query: "drama" },
            { label: "Animación", query: "animation" },
            { label: "Aventura", query: "adventure" },
            { label: "Fantasía", query: "fantasy" },
            { label: "Misterio", query: "mystery" },
        ];

        // Each "page" of our API fetches 2 pages from OMDb (20 movies)
        const omdbPageStart = (page - 1) * 2 + 1;
        const omdbPages = [omdbPageStart, omdbPageStart + 1];

        const results = await Promise.all(
            categories.map(async (cat) => {
                const movieRequests = omdbPages.map(p => {
                    const params = { apikey: this.apiKey, type: "movie", page: p };
                    if (cat.isYear) {
                        params.s = "movie"; // Generic search
                        params.y = cat.query; // Filter by year
                    } else {
                        params.s = cat.query;
                    }
                    return axios.get(this.baseURL, { params }).catch(() => ({ data: { Search: [] } }));
                });

                const responses = await Promise.all(movieRequests);
                const allMovies = responses.flatMap(res => res.data.Search || []);

                return {
                    category: cat.label,
                    movies: allMovies,
                };
            })
        );

        return results;
    }
}

module.exports = OmdbService;