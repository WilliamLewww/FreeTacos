function generateRandomRGB() {
	return [Math.floor(Math.random() * 256),Math.floor(Math.random() * 256),Math.floor(Math.random() * 256), 255];
}

function Joiner() {
	this.initialize = () => {
		this.player = new Player([10, SCREEN_HEIGHT - 25], 25, 25);
		this.platformList = [];

		this.platformList.push(new Platform([100,560], 250, 25, generateRandomRGB()));
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