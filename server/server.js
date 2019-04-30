const SPAWN_POSITION = [50,525];

const MARKER_POSITION_COUNT = 9;
const TILE_MAP = [
	[7,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,7],
	[0,5,5,5,0,5,5,0,7,5,5,0,5,5,0,5,5,0,5,5,0,0,0,0,0],
	[0,0,0,0,0,0,0,4,4,0,0,4,0,0,0,0,6,0,6,6,6,4,0,0,5],
	[2,6,0,4,4,0,0,5,5,0,0,7,0,4,0,0,0,0,6,0,0,0,0,0,0],
	[5,5,0,0,0,0,0,4,0,7,0,4,0,0,0,0,6,0,6,0,6,4,0,0,5],
	[7,4,4,0,0,4,0,0,0,4,0,0,0,0,5,5,6,0,0,0,6,0,0,0,0],
	[0,5,0,0,0,0,0,7,0,0,0,0,0,4,0,7,4,2,4,0,6,4,0,0,5],
	[0,0,0,5,0,5,5,5,5,5,5,0,0,5,5,5,5,5,5,5,5,0,0,0,0],
	[4,0,5,5,5,0,6,7,4,6,4,0,0,4,6,4,0,0,4,4,0,0,0,4,6],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,1,1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,1,1,1,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const URL = "mongodb://username:HrLgtjuOPMVqCENl@freetacos-shard-00-00-wovzf.mongodb.net:27017,freetacos-shard-00-01-wovzf.mongodb.net:27017,freetacos-shard-00-02-wovzf.mongodb.net:27017/test?ssl=true&replicaSet=FreeTacos-shard-0&authSource=admin&retryWrites=true";
var clientList = [];
var currentMarker = new Marker(getRandomMarkerLocation());

var MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcryptjs');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT);

app.get('/*', (req, res) => { 
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type");
});

io.on('connection', (socket) => {
	socket.emit('initial_connection', { client_list: clientList, tile_map: TILE_MAP, current_marker: currentMarker });

	socket.on('verified_connection', (data) => {
		console.log('New Client with ID: ' + socket.id);

		clientList.push(new Client(socket.id, data.position));
		socket.broadcast.emit('new_client', { client: clientList[clientList.length - 1] });
	});

	socket.on('disconnect', (reason) => {
		console.log("Client Disconnected with ID: " + socket.id);

		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id == socket.id) {
				clientList.splice(x, 1);
				x = clientList.length;
			}
		}

		socket.broadcast.emit('disconnected_client', { client_id: socket.id });
	});

	socket.on('attempt_login', (data) => {
		attemptLogin(socket, data.username, data.password);
	});

	socket.on('attempt_register', (data) => {
		attemptRegister(socket, data.username, data.password);
	});

	socket.on('sent_position', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id == socket.id) {
				clientList[x].position = data.position;
				x = clientList.length;
			}
		}

		socket.broadcast.emit('updated_position', { client_id: socket.id, position: data.position });
	});

	socket.on('size_change', (data) => {
		socket.broadcast.emit('size_change', { client_id: socket.id, size: data.size });
	});

	socket.on('collision_gate', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id == socket.id && clientList[x].sessionKey == data.key) {
				socket.emit('confirm_collision', { type: "gate" });
			}
		}
	});

	socket.on('collision_marker', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id == socket.id && clientList[x].sessionKey == data.key) {
				if (clientList[x].position[0] + 40 >= currentMarker.position[0] && clientList[x].position[0] <= currentMarker.position[0] + 40 &&
					clientList[x].position[1] + 40 >= currentMarker.position[1] && clientList[x].position[1] <= currentMarker.position[1] + 40) {
					
					incrementMarkerScore(socket, clientList[x].username);

					for (var y = 0; y < clientList.length; y++) {
						if (clientList[y].gameState == 1) { clientList[y].gameState = 0; }
					}
					clientList[x].gameState = 1;
					resetMarkerPosition();

					socket.emit('confirm_collision', { type: "marker", current_marker: currentMarker });
					socket.broadcast.emit('marker_collected', { client_id: socket.id, current_marker: currentMarker });
				}
			}
		}
	});

	socket.on('collision_player', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id == socket.id && clientList[x].sessionKey == data.key && clientList[x].gameState == 1) {
				for (var y = 0; y < clientList.length; y++) {
					if (clientList[y].id == data.o_client_id) {
						if (clientList[x].position[0] + 40 >= clientList[y].position[0] && clientList[x].position[0] <= clientList[y].position[0] + 40 &&
							clientList[x].position[1] + 40 >= clientList[y].position[1] && clientList[x].position[1] <= clientList[y].position[1] + 40) {

							incrementPlayerScore(socket, clientList[x].username);

							clientList[y].position = SPAWN_POSITION;
							socket.emit('confirm_collision', { type: "player" });
							socket.broadcast.emit('player_collected', { key: clientList[y].sessionKey });
						}
					}
				}
			}
		}
	});

	socket.on('request_scores', (data) => {
		sendScores(socket);
	});

	socket.on('request_top_marker', (data) => { getTopMarkerAccounts(socket); });
	socket.on('request_top_player', (data) => { getTopPlayerAccounts(socket); });
	socket.on('request_top_overall', (data) => { getTopOverallAccounts(socket); });

	setInterval(function(){
	    socket.emit('update_leaderboard'); 
	}, 30000);
});

function sendScores(socket) {
	for (var x = 0; x < clientList.length; x++) {
		if (clientList[x].id == socket.id) {
			var username = clientList[x].username;
			MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
				if (err) throw err;
				var dbo = db.db("network_game");
				dbo.collection("accounts").findOne({username: username}, (err, result) => {
					if (err) throw err;
					if (result) {
						socket.emit('sent_scores', { marker_collected: result.marker_collected, player_collected: result.player_collected });
					}
					db.close();
				});
			});
		}
	}
}

function attemptLogin(socket, username, password) {
	var connectionAlreadyExists = false;

	clientList.forEach(client => {
		if (client.username == username) {
			connectionAlreadyExists = true;
		}
	});

	if (!connectionAlreadyExists) {
		MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
			if (err) throw err;
			var dbo = db.db("network_game");
			dbo.collection("accounts").findOne({username: username}, (err, result) => {
				if (err) throw err;
				if (result) {
					if (bcrypt.compareSync(password, result.password)) { login(socket, username); }
					else { socket.emit('alert_message', { message: "Incorrect Password" }); }
				}
				else {
					socket.emit('alert_message', { message: "Incorrect Username" });
				}
			});
		});
	}
	else {
		socket.emit('alert_message', { message: "The Account is in Use" });
	}
}

function login(socket, username) {
	var sessionKey = bcrypt.hashSync(String(Date.now()), 8);
	for (var x = 0; x < clientList.length; x++) {
		if (clientList[x].id == socket.id) {
			clientList[x].username = username;
			clientList[x].sessionKey = sessionKey;
		}
	}

	console.log("User Logged in: " + username);
	socket.emit('alert_message', { message: "Successful Login!" });
	socket.emit('session_key', { key: sessionKey, username: username });

	socket.broadcast.emit('change_color', { client_id: socket.id, color: "green" });
}

function attemptRegister(socket, username, password) {
	MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
		if (err) throw err;
		var dbo = db.db("network_game");
		dbo.collection("accounts").findOne({username: username}, (err, result) => {
			if (err) throw err;
			if (!result) { register(socket, username, password); }
			else {
				socket.emit('alert_message', { message: "Username Already Exists" });
			}
			db.close();
		});
	});
}

function register(socket, username, password) {
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(password, salt);

	MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
		if (err) throw err;
		var dbo = db.db("network_game");
		dbo.collection("accounts").insertOne({username: username, password: hash, type: 0, marker_collected: 0, player_collected: 0}, (err, result) => {
			if (err) throw err;
			console.log("Created New User: " + username);
			socket.emit('alert_message', { message: "Successfully Created an Account!" });
			db.close();
		});
	});
}

function incrementMarkerScore(socket, username) {
	MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
		if (err) throw err;
		var dbo = db.db("network_game");
		dbo.collection("accounts").findOne({username: username}, (err, result) => {
			if (err) throw err;
			var newValue = { $set: {marker_collected: result.marker_collected + 1}};
			dbo.collection("accounts").updateOne({username: username}, newValue, (err, resultSecond) => {
				if (err) throw err;
				if (resultSecond) {
					sendScores(socket);
					console.log("User: " + username + " Updated Marker Score to: " + (result.marker_collected + 1));
				}
			});
			db.close();
		});
	});
}

function incrementPlayerScore(socket, username) {
	MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
		if (err) throw err;
		var dbo = db.db("network_game");
		dbo.collection("accounts").findOne({username: username}, (err, result) => {
			if (err) throw err;
			var newValue = { $set: {player_collected: result.player_collected + 1}};
			dbo.collection("accounts").updateOne({username: username}, newValue, (err, resultSecond) => {
				if (err) throw err;
				if (resultSecond) {
					sendScores(socket);
					console.log("User: " + username + " Updated Player Score to: " + (result.player_collected + 1));
				}
			});
			db.close();
		});
	});
}

function SafeObject(username, data) {
	this.username = username;
	this.data = data;
}

function getTopMarkerAccounts(socket) {
	MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
		if (err) throw err;
		var dbo = db.db("network_game");
		var sortingOrder = { marker_collected: -1 };
		dbo.collection("accounts").find().sort(sortingOrder).limit(10).toArray((err, result) => {
			if (err) throw err;
			var safeList = [];
			result.forEach(object => {
				safeList.push(new SafeObject(object.username, object.marker_collected));
			});
			socket.emit('sent_top_marker', { account_list: safeList });
			db.close();
		});
	});
}

function getTopPlayerAccounts(socket) {
	MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
		if (err) throw err;
		var dbo = db.db("network_game");
		var sortingOrder = { player_collected: -1 };
		dbo.collection("accounts").find().sort(sortingOrder).limit(10).toArray((err, result) => {
			if (err) throw err;
			var safeList = [];
			result.forEach(object => {
				safeList.push(new SafeObject(object.username, object.player_collected));
			});
			socket.emit('sent_top_player', { account_list: safeList });
			db.close();
		});
	});
}

function getTopOverallAccounts(socket) {
	MongoClient.connect(URL, { useNewUrlParser: true }, (err, db) => {
		if (err) throw err;
		var dbo = db.db("network_game");
		var sortingOrder = { marker_collected: -1, player_collected: -1 };
		dbo.collection("accounts").find().sort(sortingOrder).limit(10).toArray((err, result) => {
			if (err) throw err;
			var safeList = [];
			result.forEach(object => {
				safeList.push(new SafeObject(object.username, object.marker_collected + object.player_collected));
			});
			socket.emit('sent_top_overall', { account_list: safeList });
			db.close();
		});
	});
}

function Client(ID, position) {
	this.id = ID;
	this.position = [position[0], position[1]];

	this.username = "";
	this.sessionKey = "no-key";

	this.gameState = 0;
}

function Marker(position) {
	this.position = [position[0], position[1]];

	this.setPosition = (position) => {
		this.position = [position[0], position[1]];
	}
}

function resetMarkerPosition() {
	currentMarker.setPosition(getRandomMarkerLocation());
}

var previousMarkerIndex = -1;
function getRandomMarkerLocation() {
	var index = Math.floor(Math.random() * MARKER_POSITION_COUNT);
	while (index == previousMarkerIndex) { index = Math.floor(Math.random() * MARKER_POSITION_COUNT); }
	previousMarkerIndex = index;

	var count = 0;

	for (var y = 0; y < TILE_MAP.length; y++) {
		for (var x = 0; x < TILE_MAP[y].length; x++) {
			if (TILE_MAP[y][x] == 7 ) {
				if (count == index) {
					return [x * 40, y * 40];
				}
				count += 1;
			}
		}
	}

	return [0,0];
}