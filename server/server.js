const URL = "mongodb://username:HrLgtjuOPMVqCENl@freetacos-shard-00-00-wovzf.mongodb.net:27017,freetacos-shard-00-01-wovzf.mongodb.net:27017,freetacos-shard-00-02-wovzf.mongodb.net:27017/test?ssl=true&replicaSet=FreeTacos-shard-0&authSource=admin&retryWrites=true";
var clientList = [];

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
	socket.emit('initial_connection', { client_list: clientList, tile_map: TILE_MAP });

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
});

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
	console.log("User Logged in: " + username);
	var sessionKey = bcrypt.hashSync(String(Date.now()), 8);
	socket.emit('alert_message', { message: "Successful Login!" });
	socket.emit('session_key', { key: sessionKey, username: username });

	socket.broadcast.emit('change_color', { client_id: socket.id, color: "green" });

	for (var x = 0; x < clientList.length; x++) {
		if (clientList[x].id == socket.id) {
			clientList[x].username = username;
			clientList[x].sessionKey = sessionKey;
		}
	}
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
		dbo.collection("accounts").insertOne({username: username, password: hash, type: 0}, (err, result) => {
			if (err) throw err;
			console.log("Created New User: " + username);
			socket.emit('alert_message', { message: "Successfully Created an Account!" });
			db.close();
		});
	});
}

function Client(ID, position) {
	this.id = ID;
	this.position = [position[0], position[1]];

	this.username = "";
	this.sessionKey = "no-key";
}

const TILE_MAP = [
	[0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0],
	[0,5,5,5,0,5,5,0,0,5,5,0,5,5,0,5,5,0,5,5,0,0,0,0,0],
	[0,0,0,0,0,0,0,4,4,0,0,4,0,0,0,0,6,0,6,6,6,4,0,0,5],
	[2,6,0,4,4,0,0,5,5,0,0,0,0,4,0,0,0,0,6,0,0,0,0,0,0],
	[5,5,0,0,0,0,0,4,0,0,0,4,0,0,0,0,6,0,6,0,6,4,0,0,5],
	[0,4,4,0,0,4,0,0,0,4,0,0,0,0,5,5,6,0,0,0,6,0,0,0,0],
	[6,5,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,2,4,0,6,4,0,0,5],
	[5,0,0,5,0,5,5,5,5,5,5,0,0,5,5,5,5,5,5,5,5,0,0,0,0],
	[4,0,5,5,5,0,6,0,4,6,4,0,0,4,6,4,0,0,4,4,0,0,0,4,6],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,1,1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,1,1,1,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];