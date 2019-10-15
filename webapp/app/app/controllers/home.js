var
  sleep = require('thread-sleep'),
  express = require('express'),
  router = express.Router(),
  _ = require('underscore');

var sleepTimeout = 0;

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function(req, res, next) {
  // To ensure a delay is applied to the request to force degradation of the performances.
  if (sleepTimeout > 0) {
    sleep(sleepTimeout);
  }

  // We initialize the view counter the first time a user is requesting the resource
  if (_.isUndefined(req.session.views)) {
    req.session.views = 0;
  }

  // Increment the counter on each user visit. Store the views in the session. Next time the user will come back,
  // the counter will be incremented and the user should be able to know how many times he requested the resource.
  req.session.views += 1;

  // Return a JSON payload that contains a modern hello world, the container IP, the session ID and the number of
  // views. The server name and the tag are also returned.
  return res.status(200).header('x-backend-ip', process.env['SERVER_IP']).json({
    hello: 'world!',
    ip: process.env['SERVER_IP'],
    host: process.env['SERVER_NAME'],
    tag: process.env['SERVER_TAG'],
    sessionViews: req.session.views,
    id: req.sessionID
  }).end();
});

router.post('/delay', function(req, res, next) {
  if (req.body.delay || req.body.delay == 0) {
    sleepTimeout = req.body.delay;
    res.status(200).send({ message: 'New timeout of ' + req.body.delay + 'ms configured.' }).end();
  }
  else {
    res.status(500).send({ message: 'No delay configured due to an error. Maybe you have not provided the correct JSON payload.' }).end();
  }
});
