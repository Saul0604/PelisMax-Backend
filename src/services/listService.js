const List = require('../models/List');
const Movie = require('../models/Movie');

class ListService {
    /**
     * Obtiene todas las listas de un usuario
     */
    async getUserLists(userId) {
        return await List.find({ userId }).populate('movies');
    }

    /**
     * Crea una nueva lista personalizada
     */
    async createList(userId, name) {
        const newList = new List({ userId, name });
        await newList.save();
        return newList;
    }

    /**
     * Agrega una película a una lista específica
     */
    async addMovieToList(userId, listId, movieData) {
        const { movieId, title, poster, releaseYear } = movieData;

        // 1. Buscar la lista y verificar propiedad
        const list = await List.findOne({ _id: listId, userId });
        if (!list) {
            throw new Error("Lista no encontrada o no tienes permiso");
        }

        // 2. Verificar si la película ya está en la lista
        if (list.movies.includes(movieId)) {
            throw new Error("La película ya está presente en esta lista");
        }

        // 3. Asegurar que la película exista en nuestra colección de Movies (para populate)
        await Movie.findByIdAndUpdate(
            movieId,
            { title, poster, releaseYear },
            { upsert: true, new: true }
        );

        // 4. Agregar a la lista
        list.movies.push(movieId);
        await list.save();

        return list;
    }

    /**
     * Obtiene el detalle de una lista específica
     */
    async getListById(userId, listId) {
        const list = await List.findOne({ _id: listId, userId }).populate('movies');
        if (!list) throw new Error("Lista no encontrada");
        return list;
    }
}

module.exports = ListService;
