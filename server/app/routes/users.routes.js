const users = require('../controllers/users.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.create);
    app.route(app.rootUrl + '/users/login')
        .post(users.login);
    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);
    app.route(app.rootUrl + '/users/:userId')
        .get(users.getOneUser);
    app.route(app.rootUrl + '/users/:userId')
        .patch(users.editOneUser);
    app.route(app.rootUrl + '/users/:userId/photo')
        .put(users.insertPhoto);
    app.route(app.rootUrl + '/users/:userId/photo')
        .get(users.getPhoto);
    app.route(app.rootUrl + '/users/:userId/photo')
        .delete(users.removePhoto);

};


