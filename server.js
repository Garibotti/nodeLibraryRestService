//server configuration

const app  = require('./app.js');
const port = process.env.PORT || 8000;

//server up
const server = app.listen(port, function(){
	console.log(`Server listening on port: ${port}`)
});
