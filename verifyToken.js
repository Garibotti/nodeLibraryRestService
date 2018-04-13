const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('./config.js').get(process.env.NODE_ENV);

//this function verify if the token is valid and decrypt the userId for later use.
function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, config.secretKey, function(err, decoded) {
    if (err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
     //if everything good, save to request for use in other routes
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;