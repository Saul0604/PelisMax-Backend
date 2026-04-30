const userRouter = require('./usersRoutes');
const movieRoutes = require('./movies');
const ratingRoutes = require('./ratings');

function routerApi(app) {
    app.use('/api/auth', userRouter);
    app.use('/api/movies', movieRoutes);
    app.use('/api/rate', ratingRoutes);
}

module.exports = routerApi;