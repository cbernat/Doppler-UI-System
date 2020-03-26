const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));

/*if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY "+
    "environment variables. You can use the following ones:");
  console.log(webPush.generateVAPIDKeys());
  return;
}*/

var publicVapidKey =
  'BFtBVunx6Lg_4ziA6b_Oe-9iqQetudiBzkukb1UOOWItZlbdPXCnMLjTfM6gnbmzrusaGlifwWWaFRWnef_H40Y';
var privateVapidKey = 'F1eZLlbqpH5d8nHetf6xzzBnlgq8WbFlQ2A9jEl9X4E';

webPush.setVapidDetails(
  'mailto:cbernat@makingsense.com',
  publicVapidKey,
  privateVapidKey,
);

/*module.exports = function(app, route) {
  app.get(route + 'vapidPublicKey', function(req, res) {
    res.send(publicVapidKey);
  });

  app.post(route + 'register', function(req, res) {
    res.sendStatus(201);
  });

  app.post(route + 'sendNotification', function(req, res) {
    const subscription = req.body.subscription;
    const payload = req.body.payload;
    const options = {
      TTL: 0,
    };

    setTimeout(function() {
      webPush
        .sendNotification(subscription, payload, options)
        .then(function() {
          res.sendStatus(201);
        })
        .catch(function(error) {
          console.log(error);
          res.sendStatus(500);
        });
    }, req.body.delay * 1000);
  });
};*/

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.post('/sendNotification', (req, res) => {
  const subscription = req.body.subscription;

  res.status(201).json({});

  const payload = JSON.stringify({
    title: 'Push notifications with Service Workers',
    message: req.body.message,
  });

  webPush
    .sendNotification(subscription, payload)
    .catch((error) => console.error(error));
});

app.set('port', 5000);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
