const PLAYER_WIDTH = 27;
const PLAYER_HEIGHT = 27;

function generateRandomRGB() {
	return [Math.floor(Math.random() * 256),Math.floor(Math.random() * 256),Math.floor(Math.random() * 256), 255];
}

function Joiner() {
	this.initialize = () => {
		this.background1 = new RectangleTextured(520, 400, 440, 200, 6);
		this.background2 = new RectangleTextured(40, 400, 480, 200, 7);
		this.background3 = new RectangleTextured(0, 0, 1000, 400, 8);
		this.background4 = new RectangleTextured(1000, 0, 1000, 400, 8);

		this.marker = new Marker(currentMarkerPosition);
		this.player = new Player([50, SCREEN_HEIGHT - 75], PLAYER_WIDTH, PLAYER_HEIGHT);
		this.platformList = [];

		for (var y = 0; y < TILE_MAP.length; y++) {
			for (var x = 0; x < TILE_MAP[y].length; x++) {
				if (TILE_MAP[y][x] == 1) {
					this.platformList.push(new Platform(1, [x * 40, y * 40], 40, 40, generateRandomRGB()));
				}
				if (TILE_MAP[y][x] == 2) {
					this.platformList.push(new Platform(2, [x * 40,(y * 40) + 20], 40, 20, [200,255,0,255]));
				}
				if (TILE_MAP[y][x] == 3) {
					this.platformList.push(new Gateway([x * 40, y * 40], 80, 40));
				}
				if (TILE_MAP[y][x] == 4) {
					this.platformList.push(new Platform(1, [x * 40,(y * 40) + 20], 40, 20, [200,200,200,255]));
				}
				if (TILE_MAP[y][x] == 5) {
					this.platformList.push(new Platform(1, [x * 40,y * 40], 40, 20, [200,200,200,255]));
				}
				if (TILE_MAP[y][x] == 6) {
					this.platformList.push(new Platform(1, [x * 40,y * 40], 40, 40, [200,200,200,255]));
				}
				if (TILE_MAP[y][x] == 8) {
					this.platformList.push(new Platform(1, [x * 40, y * 40], 40, 20, generateRandomRGB()));
				}
				if (TILE_MAP[y][x] == 9) {
					this.platformList.push(new GatewayDrop([x * 40, y * 40], 40, 40));
				}
			}
		}
	}

	this.update = (elapsedTimeMS) => {
		this.background3.x -= 75 * (elapsedTimeMS / 1000);
		this.background4.x -= 75 * (elapsedTimeMS / 1000);
		if (this.background3.x + this.background3.width <= 0) { this.background3.x = 1000; this.background4.x = 0; }
		if (this.background4.x + this.background4.width <= 0) { this.background4.x = 1000; this.background3.x = 0; }

		this.player.update(elapsedTimeMS);

		if (this.player.gameState == 1) {
			clientList.forEach(client => {
				if (this.player.checkCollisionClient(client)) {
					collisionPlayer(client.id);
				}
			});
		}

		if (this.player.checkCollision(this.marker)) {
			collisionMarker();
		}

		for (var x = 0; x < this.platformList.length; x++) {
			if (this.player.checkCollision(this.platformList[x])) {
				if (this.platformList[x].id == 3) {
					if (this.platformList[x].currentState == -1) {
						if (this.player.centerY() < this.platformList[x].centerY()) { 
							this.platformList[x].incrementState(); 
						}
					}
					else {
						if (this.player.centerY() > this.platformList[x].centerY()) { collisionGate(); }
						this.player.handleCollision(this.platformList[x]);
					}
				}
				else { this.player.handleCollision(this.platformList[x]); }

				if (this.platformList[x].id == 4) { collisionGateDrop(); }
			}
		}
	}

	this.draw = () => {
		this.background1.draw();
		this.background2.draw();
		this.background3.draw();
		this.background4.draw();
		this.marker.draw();
		clientList.forEach(client => { client.rectangle.draw(client.position[0], client.position[1]); });
		this.player.draw();
		this.platformList.forEach(platform => { platform.draw(); });
	}
}