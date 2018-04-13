const mysql = require('mysql');
const config = require('./config.js').get(process.env.NODE_ENV);
//Database connection
const connection = mysql.createConnection(config.database);

connection.connect(function(error){
	if(error){
		console.log(error);
		//res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));//database error change it to a function
	}
});

module.exports = connection;

