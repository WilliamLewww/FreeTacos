function generateRandomRGB() {
	return [Math.floor(Math.random() * 256),Math.floor(Math.random() * 256),Math.floor(Math.random() * 256), 255];
}

function Joiner() {
	this.initialize = () => {
		this.player = new Player([50, SCREEN_HEIGHT - 75], 25, 25);
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
			}
		}
	}

	this.update = (elapsedTimeMS) => {
		this.player.update(elapsedTimeMS);

		this.platformList.forEach(platform => {
			if (this.player.checkCollision(platform)) {
				this.player.handleCollision(platform);

				if (platform.id == 3) {
					collisionWithGate();
				}
			}
		});
	}

	this.draw = () => {
		clientList.forEach(client => {
			client.rectangle.draw(client.position[0], client.position[1]);
		});

		this.player.draw();

		this.platformList.forEach(platform => {
			platform.draw();
		});
	}
}