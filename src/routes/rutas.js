const userRouter = require('./usersRoutes');
const movieRoutes = require('./movies');

function routerApi(app) {
    app.use('/api/auth', userRouter);
    app.use('/api/movies', movieRoutes);
}

module.exports = routerApi;