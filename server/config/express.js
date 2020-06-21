const express = require('express');
const bodyParser = require('body-parser');
const { allowCrossOriginRequestsMiddleware } = require('../app/middleware/cors.middleware');


module.exports = function () {
    // INITIALISE EXPRESS //
    const app = express();
    app.rootUrl = '/api/v1';

    // MIDDLEWARE
    app.use(allowCrossOriginRequestsMiddleware);
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.raw({limit: '50mb', type: 'image/jpeg' }));
    app.use(bodyParser.raw({limit: '50mb', type: 'image/png' }));
    app.use(bodyParser.raw({limit: '50mb', type: 'image/gif' }));
    app.use(bodyParser.raw({limit: '50mb', type: 'image/jpg' }));
    app.use(bodyParser.raw({limit: '50mb', type: 'text/plain' }));

    // DEBUG (you can remove these)
    app.use((req, res, next) => {
        console.log(`##### ${req.method} ${req.path} #####`);
        next();
    });

    app.get('/', function (req, res) {
        res.send({ 'message': 'Hello World!' })
    });

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require('../app/routes/users.routes')(app);
    require('../app/routes/petitions.routes')(app);

    return app;
};
