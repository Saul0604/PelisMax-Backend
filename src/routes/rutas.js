const userRouter = require('./usersRoutes');
const movieRoutes = require('./movies');
const commentRoutes = require('./commentsRoutes');
const ratingRoutes = require('./ratings');
const watchlistRoutes = require('./watchlistRoutes');

function routerApi(app) {
    app.use('/api/auth', userRouter);
    app.use('/api/movies', movieRoutes);
    app.use('/api/comments', commentRoutes);
    app.use('/api/rate', ratingRoutes);
    app.use('/api/watchlist', watchlistRoutes);
}

module.exports = routerApi;