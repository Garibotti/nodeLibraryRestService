const express = require('express');
const router  = express.Router();
const bcrypt = require('bcryptjs');
const db = require('./db.js');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const config = require('./config.js').get(process.env.NODE_ENV);

//validation with Joi - EXAMPLE
function validateUser(bodyObject){	
	const schema = {
		name: Joi.string().required(),
		password: Joi.string().required(),
		email: Joi.string().email()
	};
	return Joi.validate(bodyObject, schema);
};

//creating user
router.post('/', function(req, res){
	//validation with Joi - EXAMPLE
	const { error } = validateUser(req.body);//object destructuring 
	if(error){
		res.status(400).send(JSON.stringify({"status":400, "error":error.details[0].message, "response":null}));
		return;
	}

	const bodyObject = req.body;
	var hashedPassword = bcrypt.hashSync(bodyObject.password, 8); //from internet, basic encryption 
	const query = "INSERT INTO clientes SET ?";
	const values = {
		"nome": bodyObject.name,
		"email": bodyObject.email,
		"senha": hashedPassword
	};
	db.query(query, values, function(error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{
			const lastId = result.insertId;
			res.send(JSON.stringify({"status":200, "error":null, "response":lastId}))
		}
	});
});

//login, generates a token and creates a session
router.post('/login', function(req, res){
	const bodyObject = req.body;
	const query = 'SELECT * FROM clientes WHERE email = ?';
	db.query(query, bodyObject.email, function(error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{
			const resultObject = result[0];
			var isValid = bcrypt.compareSync(bodyObject.password, resultObject.senha);//cheking if the hashed password matches.
			if(isValid){
				const token = createToken(resultObject.id);
				req.session.user = token;
				res.send(JSON.stringify({"status":200, "error":null, "response":`{ auth: true, token: ${token} }`}))
			}else{
				res.send(JSON.stringify({"status":401, "error":null, "response":"Unauthorized access"}))
			}
			
		}
	});
});

//destroy session
router.get('/logout', function(req, res){
	req.session.destroy();
	res.send(JSON.stringify({"status":200, "error":null, "response":"Logout success!"}))
});

// create a token --- todo:if token managment requires more than this function then is a good practice to move those functions to a new file
function createToken(userId){
	let token = jwt.sign({ id: userId }, config.secretKey, {
  		expiresIn: 60 * 60 // expires in 1 hour
	});
	return token;
};

module.exports = router;