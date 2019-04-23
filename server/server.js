var clientList = [];

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
	socket.emit('initial_connection', { client_list: clientList });

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