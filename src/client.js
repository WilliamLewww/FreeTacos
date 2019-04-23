var clientList = [];

var socket = io.connect('http://localhost');

socket.on('initial_connection', function (data) {
	console.log('Connected with ID: ' + socket.id);
	socket.emit('verified_connection', { position: [joiner.player.rectangle.x, joiner.player.rectangle.y] });

	clientList = data.client_list;
});

socket.on('new_client', function (data) {
	clientList.push(data.client);
});

socket.on('disconnected_client', function (data) {
	for (var x = 0; x < clientList.length; x++) {
		if (clientList[x].id.toString() == data.client_id) {
			clientList.splice(x, 1);
			x = clientList.length;
		}
	}
});