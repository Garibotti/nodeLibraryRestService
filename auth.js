const express = require('express');

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
	const token = req.headers['x-access-token'];
	if (req.session && req.session.user === token)//checking if the token is live in the session
		return next();
	else
		return res.status(401).send({ auth: false, message: 'Unauthorized access' });	
};

module.exports = auth;