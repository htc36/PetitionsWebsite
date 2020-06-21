const users = require('../controllers/petitions.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/petitions')
        .get(users.getPetition);
    app.route(app.rootUrl + '/petitions')
        .post(users.postPetition);
    app.route(app.rootUrl + '/petitions/categories')
        .get(users.getCat);
    app.route(app.rootUrl + '/petitions/:id')
        .get(users.getOnePetition);
    app.route(app.rootUrl + '/petitions/:id')
        .patch(users.editOnePetition);
    app.route(app.rootUrl + '/petitions/:id')
        .delete(users.removePetition);
    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(users.getPetitionPhoto);
    app.route(app.rootUrl + '/petitions/:id/photo')
        .put(users.insertPetitionPhoto);
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(users.getSignatures);
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .post(users.insertSignature);
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .delete(users.removeSignature);

}



