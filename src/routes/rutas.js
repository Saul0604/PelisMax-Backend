const userRouter = require('./usersRoutes');
const movieRoutes = require('./movies');
const commentRoutes = require('./commentsRoutes');

function routerApi(app) {
    app.use('/api/auth', userRouter);
    app.use('/api/movies', movieRoutes);
    app.use('/api/comments', commentRoutes);
}

module.exports = routerApi;