function generateRandomRGB() {
	return [Math.floor(Math.random() * 256),Math.floor(Math.random() * 256),Math.floor(Math.random() * 256), 255];
}

function Joiner() {
	this.initialize = () => {
		this.player = new Player([10, SCREEN_HEIGHT - 25], 25, 25);
		this.platformList = [];

		for (var y = 0; y < TILE_MAP.length; y++) {
			for (var x = 0; x < TILE_MAP[y].length; x++) {
				if (TILE_MAP[y][x] == 1) {
					this.platformList.push(new Platform([x * 50,y * 50], 50, 50, generateRandomRGB()));
				}
			}
		}
	}

	this.update = () => {
		this.player.update();

		this.platformList.forEach(platform => {
			if (this.player.checkCollision(platform)) {
				this.player.handleCollision(platform);
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

//20x12
const TILE_MAP = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];