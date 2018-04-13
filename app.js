//file used to configure the app
const express = require('express');
const app =  express();
const session = require('express-session');

app.use(express.json());

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));


const movies = require('./movies.js');
app.use('/movies', movies);	

const users = require('./users.js');
app.use('/users', users);

module.exports = app;