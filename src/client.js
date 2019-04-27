var TILE_MAP;
var currentMarkerPosition;
var currentMarkerGameState;

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

function collisionGate() {
	socket.emit('collision_gate', { key: sessionKey });
}

function collisionMarker() {
	socket.emit('collision_marker', { key: sessionKey, position: [joiner.player.rectangle.x, joiner.player.rectangle.y] });
}

function sizeChange(size) {
	socket.emit('size_change', { size: size } );
}

function createClientListeners() {
	socket.on('initial_connection', (data) => {
		TILE_MAP = data.tile_map;
		currentMarkerPosition = data.current_marker.position;
		currentMarkerGameState = data.current_marker.gameState;
		
		cancelAnimationFrame(mainReq);
		initialize();

		console.log('Connected with ID: ' + socket.id);
		socket.emit('verified_connection', { position: [joiner.player.rectangle.x, joiner.player.rectangle.y] });

		clientList = data.client_list;
		clientList.forEach(client => {
			if (client.username.length > 0) {
				if (client.gameState == 1){ client.rectangle = new Rectangle(undefined, undefined, 25, 25, [0,0,255,100]); }
				else { client.rectangle = new Rectangle(undefined, undefined, 25, 25, [0,255,0,100]); }
			}
			else { client.rectangle = new Rectangle(undefined, undefined, 25, 25, [255,0,0,100]); }
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
		document.getElementById('username-input').remove();
		document.getElementById('password-input').remove();
		document.getElementById('login-button').remove();
		document.getElementById('register-button').remove();

		var accountDiv = document.getElementById('account-div');
		var usernameText = document.createElement('p');
		usernameText.innerHTML = 'Current Username: ' + data.username;
		var logoutButton = document.createElement('BUTTON');
		logoutButton.innerHTML = 'Logout';
		logoutButton.addEventListener('click', (event) => {
			window.location.reload();
		});
		accountDiv.innerHTML = "";
		accountDiv.appendChild(usernameText);
		accountDiv.appendChild(logoutButton);
		joiner.player.setColor([0,255,0,255]);
	});

	socket.on('new_client', (data) => {
		clientList.push(data.client);
		clientList[clientList.length - 1].rectangle = new Rectangle(undefined, undefined, PLAYER_WIDTH, PLAYER_HEIGHT, [255,0,0,100]);
	});

	socket.on('updated_position', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id.toString() == data.client_id) {
				clientList[x].position = data.position;
				x = clientList.length;
			}
		}
	});

	socket.on('change_color', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id.toString() == data.client_id) {
				if (data.color == "green") {
					clientList[x].rectangle.color = [0,255,0,255];
					x = clientList.length;
				}
			}
		}
	});

	socket.on('size_change', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id.toString() == data.client_id) {
				if (data.size == "small") {
					clientList[x].rectangle.height = 25.0 / 2.0;
					x = clientList.length;
				}
				if (data.size == "medium") {
					clientList[x].rectangle.height = 25.0;
					x = clientList.length;
				}
			}
		}
	});

	socket.on('confirm_collision', (data) => {
		if (data.type == "gate") {
			for (var x = 0; x < joiner.platformList.length; x++) {
				if (joiner.platformList[x].id == 3) {
					joiner.platformList[x].incrementState();
				}
			}
		}

		if (data.type == "marker") {
			joiner.player.setColor([0,0,255,255]);
			joiner.player.gameState = 1;
			joiner.marker.gameState = 1;
		}
	});

	socket.on('marker_collected', (data) => {
		for (var x = 0; x < clientList.length; x++) {
			if (clientList[x].id.toString() == data.client_id) {
				clientList[x].rectangle.color = [0,0,255,255];
				joiner.marker.gameState = 1;
			}
		}
	});
}

function sendPosition() {
	socket.emit('sent_position', { position: [joiner.player.rectangle.x, joiner.player.rectangle.y] });
}