const express = require('express');
const router = express.Router();
const db = require('./db.js');
const auth = require('./auth.js');
const verifyToken = require('./verifyToken.js');

// search all movies
router.get('/', verifyToken, auth, function (req, res){
	db.query('SELECT * FROM filmes', function (error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{
			res.status(200).send(JSON.stringify({"status":200, "error":null, "response":result}));
		}
	});			
});

//search movie by id
router.get('/:id', verifyToken, auth, function (req, res){
	db.query('SELECT * FROM filmes WHERE id = ?', req.params.id, function (error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{	
			res.status(200).send(JSON.stringify({"status":200, "error":null, "response":result}));
		}
	});	
});

//search movie by name
router.get('/searchByName/:name', verifyToken, auth,  function (req, res){
	db.query('SELECT * FROM filmes WHERE titulo like ?', '%' + req.params.name + '%', function (error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{
			res.send(JSON.stringify({"status":200, "error":null, "response":result}));
		}
	});	
});

//show copies of a movies
router.get('/:id/copies/', verifyToken, auth, function (req, res){
	const query = 	'SELECT fm.titulo, di.nome as Diretor, co.id as CopiaId, co.disponivel ' +
					'FROM filmes fm ' +
					'JOIN diretores di ON fm.diretor_id = di.id ' +
					'JOIN copias co ON fm.id = co.filme_id ' +
					'WHERE fm.id = ?';
	db.query(query, req.params.id, function (error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{
			res.send(JSON.stringify({"status":200, "error":null, "response":result}));
		}
	});	
});

//show all movies and their available copies
router.get('/copies/available', verifyToken, auth, function (req, res){
	const query = 	'SELECT fm.id as FilmeId, fm.titulo as Título, di.nome as Diretor, count(co.disponivel) as "Quantidade Disp" ' +
					'FROM filmes fm ' +
					'JOIN diretores di ON fm.diretor_id = di.id ' +
					'JOIN copias co ON fm.id = co.filme_id ' +
					'WHERE co.disponivel = 1 '+
					'GROUP BY fm.id '+
					'HAVING count(co.disponivel) > 0'; //this query returns movies that have at least one copy available 
	db.query(query, function (error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{
			res.send(JSON.stringify({"status":200, "error":null, "response":result}));
		}
	});	
});

//rent a movie
router.post('/:idMovie/copies/:idCopy', verifyToken, auth, function (req, res){
	const movieId = req.params.idMovie;
	const copyId = req.params.idCopy;

	var checkPromise = checkIfMovieIsAvailable(movieId, copyId); //promise is waiting for the return of the movie availability 	
	checkPromise.then(function (result){
		var isMovieAvailable = result;
		if(isMovieAvailable === 1){ //if the movies is available then insert the related data
			const query = 'INSERT INTO locacao SET ?';
			const insertedValues = {
				"dt_locacao" : '2018-03-20', //hard coded not worried about momentum and date convertion
				"copia_id" 	 : copyId,
				"cliente_id" : req.userId // from auth after decoding token
			};
			db.query(query, insertedValues, function (error, result){
				if(error){
					res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
				}else{	
					updateCopyAvailability(copyId);//update the copy availability
					res.send(JSON.stringify({"status":200, "error":null, "response":"Movie rented!"}))
				}		
			});
		}else{
			res.send(JSON.stringify({"status":200, "error":null, "response":"Movie is not available!"}))
		}
	},function(error){
		res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		console.log('error promise checkIfMovieIsAvailable');//HOW TO LOG THIS?
	});
});

// return a movie
router.put('/copies/:idCopy', verifyToken, auth, function (req, res){
	const copyId = req.params.idCopy;
	const userId = req.userId;
	var rentedByUserPromise = checkIfMovieWasRentedByUser(userId, copyId);
	rentedByUserPromise.then(function (result){
		var objResult = result;
		if(objResult.resultado > 0){
			updateReturnDate(objResult.id);//update the return date
			updateCopyAvailability(copyId);//update the copy availability
			res.send(JSON.stringify({"status":200, "error":null, "response":"Movie returned!"}))
		}else{
			res.send(JSON.stringify({"status":200, "error":null, "response":"Movie was not rented by the User!"}))
		}
	},function(error){
		res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		console.log('error promise checkIfMovieWasRentedByUser');//HOW TO LOG THIS?
	});
});

//function used as promise to check if a movie is available
checkIfMovieIsAvailable = function (movieId, copyId){
	const query = 'SELECT COUNT(*) as Total, disponivel FROM copias WHERE id = ? and filme_id = ? ';
	const params = [copyId, movieId];
	return new Promise ( function(resolve, reject){
		db.query(query, params, function (error, result){
		if(error){
			reject(error);
		}else{
			const resultObj = result[0];
			resolve(resultObj.disponivel);
			//return resultObj.disponivel;
		}
		});
	});
};

//update the copy availability
function updateCopyAvailability (copyId){
	const query = 'UPDATE copias SET disponivel = IF(disponivel,0,1) WHERE id = ?';
	db.query(query, copyId, function (error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{
			//Movie rented
		}
	});
}

//function used as promise to check if an user has actually rented the movie he is trying to return.
checkIfMovieWasRentedByUser = function (userId, copyId){
	const query = 'SELECT count(*) as resultado, id FROM locacao WHERE cliente_id = ? AND copia_id = ? AND dt_devolucao is null;';
	const params = [userId, copyId];

	return new Promise ( function(resolve, reject){
		db.query(query, params, function (error, result){
		if(error){
			reject(error);
		}else{
			const resultObj = result[0];
			resolve(resultObj);
			//return resultObj.disponivel;
		}
		});
	});
}

//update the return date
function updateReturnDate (id){
	const query = 'UPDATE locacao SET dt_devolucao = "2018-03-20" where id = ?';
	db.query(query, id, function (error, result){
		if(error){
			res.status(500).send(JSON.stringify({"status":500, "error":error, "response":null}));
		}else{
			//Movie returned
		}
	});
}

module.exports = router;