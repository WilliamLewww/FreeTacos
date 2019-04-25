var TILE_MAP;
var clientList = [];

var sessionKey = "";

function login(username, password) {
	if (username.length > 0 && password.length > 0 && socket.connected) {
		socket.emit('attempt_login', { username: username, password: password });
	}
	else {
		alert("Please Enter a Valid Username/Password");
	}

	document.getElementById('username-input').value = "";
	document.getElementById('password-input').value = "";
}

function register(username, password) {
	if (username.length > 0 && password.length > 0 && socket.connected) {
		socket.emit('attempt_register', { username: username, password: password });
	}
	else {
		alert("Please Enter a Valid Username/Password");
	}

	document.getElementById('username-input').value = "";
	document.getElementById('password-input').value = "";
}

function createClientListeners() {
	socket.on('initial_connection', (data) => {
		TILE_MAP = data.tile_map;
		cancelAnimationFrame(mainReq);
		initialize();

		console.log('Connected with ID: ' + socket.id);
		socket.emit('verified_connection', { position: [joiner.player.rectangle.x, joiner.player.rectangle.y] });

		clientList = data.client_list;
		clientList.forEach(client => {
			client.rectangle = new Rectangle(undefined, undefined, 25, 25, [255,0,0,100]);
		});
	});

	socket.on('disconnected_client', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id.toString() == data.client_id) {
				clientList.splice(x, 1);
				x = clientList.length;
			}
		}
	});

	socket.on('alert_message', (data) => {
		alert(data.message);
	});

	socket.on('session_key', (data) => {
		sessionKey = data.key;
	});

	socket.on('new_client', (data) => {
		clientList.push(data.client);
		clientList[clientList.length - 1].rectangle = new Rectangle(undefined, undefined, 25, 25, [255,0,0,100]);
	});

	socket.on('updated_position', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id.toString() == data.client_id) {
				clientList[x].position = data.position;
				x = clientList.length;
			}
		}
	});
}

function sendPosition() {
	socket.emit('sent_position', { position: [joiner.player.rectangle.x, joiner.player.rectangle.y] });
}