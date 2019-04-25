var clientList = [];

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://username:HrLgtjuOPMVqCENl@freetacos-shard-00-00-wovzf.mongodb.net:27017,freetacos-shard-00-01-wovzf.mongodb.net:27017,freetacos-shard-00-02-wovzf.mongodb.net:27017/test?ssl=true&replicaSet=FreeTacos-shard-0&authSource=admin&retryWrites=true";

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT);

app.get('/*', function(req, res) { 
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

	socket.on('sent_position', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id == socket.id) {
				clientList[x].position = data.position;
				x = clientList.length;
			}
		}

		socket.broadcast.emit('updated_position', { client_id: socket.id, position: data.position });
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
});

function Client(ID, position) {
	this.id = ID;
	this.position = [position[0], position[1]];
}

const TILE_MAP = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,1,1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,1,1,1,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,2,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];