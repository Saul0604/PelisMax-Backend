const userRouter = require('./usersRoutes');

function routerApi(app) {
    app.use('/api/auth', userRouter);
}

module.exports = routerApi;