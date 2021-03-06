'use strict';

var jwt = require('jsonwebtoken');
var config = require('./config').get(process.env.NODE_ENV);

function verifyToken(req, res, next) {
  var token;
  token = req.headers['x-access-token'];
  if (!token){
    token = req.headers['token'];
    if (!token){
      return res.status(403).send({ auth: false, message: 'No token provided.' });
    }
  }

  jwt.verify(token, config.secret, function(err, decoded) {
    if (err)
      return res.status(500).send({
        auth: false, message: 'Failed to authenticate token.',
      });
    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;
