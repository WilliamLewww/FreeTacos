var TILE_MAP;
var clientList = [];

//var socket = io.connect('http://localhost');
var socket = io.connect('https://freetacos.herokuapp.com');

socket.on('initial_connection', (data) => {
	TILE_MAP = data.tile_map;
	initialize();

	console.log('Connected with ID: ' + socket.id);
	socket.emit('verified_connection', { position: [joiner.player.rectangle.x, joiner.player.rectangle.y] });

	clientList = data.client_list;
	clientList.forEach(client => {
		client.rectangle = new Rectangle(undefined, undefined, 25, 25);
	});
});

socket.on('new_client', (data) => {
	clientList.push(data.client);
	clientList[clientList.length - 1].rectangle = new Rectangle(undefined, undefined, 25, 25);
});

socket.on('disconnected_client', (data) => {
	for (var x = 0; x < clientList.length; x++) {
		if (clientList[x].id.toString() == data.client_id) {
			clientList.splice(x, 1);
			x = clientList.length;
		}
	}
});

socket.on('updated_position', (data) => {
	for (var x = 0; x < clientList.length; x++) {
		if (clientList[x].id.toString() == data.client_id) {
			clientList[x].position = data.position;
			x = clientList.length;
		}
	}
});

function sendPosition() {
	socket.emit('sent_position', { position: [joiner.player.rectangle.x, joiner.player.rectangle.y] });
}