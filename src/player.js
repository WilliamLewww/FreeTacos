const GRAVITY = 9.8;

const POSITION_INTERVAL = 0.1;

const MOVE_SPEED = [125, 100];
const JUMP_SPEED = [275, 175];

function Player(position, width, height, color = [255,0,0,255]) {
	this.rectangle = new Rectangle(position[0], position[1], width, height, color);
	this.velocityX = 0;
	this.velocityY = 0;
	this.onGround = false;
	this.canJump = false;

	this.gameState = 0;

	this.isSmall = false;

	this.previousX = 0;
	this.previousY = 0;
	this.positionTimer = 0.0;

	this.moveSpeed = MOVE_SPEED[0];
	this.jumpSpeed = JUMP_SPEED[0];

	this.top = () => { return this.rectangle.y; }
	this.bottom = () => { return this.rectangle.y + this.rectangle.height; }
	this.left = () => { return this.rectangle.x; }
	this.right = () => { return this.rectangle.x + this.rectangle.width; }

	this.centerX = () => { return this.rectangle.x + (this.rectangle.width / 2); }
	this.centerY = () => { return this.rectangle.y + (this.rectangle.height / 2); }

	this.setColor = (color) => {
		this.rectangle.color = color;
	}

	this.update = (elapsedTimeMS) => {
		this.velocityX = 0;

		if (inputList.indexOf(37) != -1 && inputList.indexOf(39) == -1 && this.left() > 0) { this.velocityX = -this.moveSpeed; }
		if (inputList.indexOf(37) == -1 && inputList.indexOf(39) != -1 && this.right() < SCREEN_WIDTH) { this.velocityX = this.moveSpeed; }

		if (inputList.indexOf(40) != -1) { this.changeToSmall(); }
		else { this.changeToBig(); }

		if (this.top() <= 0) {
			this.velocityY = 0;
			this.rectangle.y = 0;
		}

		if (this.bottom() < SCREEN_HEIGHT) {
			if (this.velocityY < 0 && inputList.indexOf(32) == -1) {
				this.velocityY += GRAVITY;
			}

			this.velocityY += GRAVITY;
		}
		else {
			this.velocityY = 0;
			this.rectangle.y = SCREEN_HEIGHT - (this.rectangle.height);
			this.onGround = true;

			if (inputList.indexOf(32) == -1) { this.canJump = true; }
		}

		if (this.onGround && this.canJump) {
			if (inputList.indexOf(32) != -1) {
				this.canJump = false;
				this.onGround = false;
				this.velocityY = -this.jumpSpeed;
			}
		}

		if (!isNaN(elapsedTimeMS)) {
			this.rectangle.x += this.velocityX * (elapsedTimeMS / 1000.0);
			this.rectangle.y += this.velocityY * (elapsedTimeMS / 1000.0);
		}

		if (this.positionTimer >= POSITION_INTERVAL) {
			if (this.previousX != this.rectangle.x || this.previousY != this.rectangle.y) {
				this.previousX = this.rectangle.x;
				this.previousY = this.rectangle.y;
				this.positionTimer = 0.0;

				sendPosition();
			}
		}
		else { this.positionTimer += elapsedTimeMS / 1000.0; }

		this.onGround = false;
	}

	this.changeToSmall = () => {
		if (this.isSmall == false) {
			this.rectangle.height = PLAYER_HEIGHT / 2;
			this.rectangle.y += PLAYER_HEIGHT / 2;
			this.moveSpeed = MOVE_SPEED[1];
			this.jumpSpeed = JUMP_SPEED[1];
			this.isSmall = true;
			sizeChange("small");
		}
	}

	this.changeToBig = () => {
		var canChangeToBig = true;
		if (this.top() - 25 < 0) { canChangeToBig = false; }
		joiner.platformList.forEach(platform => {
			if (this.right() > platform.left() && this.left() < platform.right() &&
				this.bottom() >= platform.centerY() && this.top() - (PLAYER_HEIGHT / 2) < platform.bottom()) {

				canChangeToBig = false;
			}
		});

		if (canChangeToBig && this.isSmall == true) {
			this.rectangle.height = PLAYER_HEIGHT;
			this.rectangle.y -= PLAYER_HEIGHT / 2;
			this.moveSpeed = MOVE_SPEED[0];
			this.jumpSpeed = JUMP_SPEED[0];
			this.isSmall = false;
			sizeChange("medium");
		}
	}

	this.draw = () => {
		this.rectangle.draw();
	}

	this.checkCollision = (platform) => {
		if (this.right() >= platform.left() && this.left() <= platform.right() &&
			this.bottom() >= platform.top() && this.top() <= platform.bottom()) {

			return true;
		}

		return false;
	}

	this.checkCollisionClient = (client) => {
		if (this.right() >= client.position[0] && this.left() <= client.position[0] + client.rectangle.width &&
			this.bottom() >= client.position[1] && this.top() <= client.position[1] + client.rectangle.height) {

			return true;
		}

		return false;
	}

	this.checkCollisionBottom = (platform) => {
		if (this.top() <= platform.bottom() && this.top() >= platform.centerY() && 
			this.left() <= platform.right() - 3 && this.right() >= platform.left() + 3) {
			return true;
		}

		return false;
	}

	this.handleCollision = (platform) => {
		var overlapX = 0.0, overlapY = 0.0;
		if (this.centerX() > platform.centerX()) { overlapX = platform.right() - this.left(); }
		else { overlapX = -(this.right() - platform.left()); }
		if (this.centerY() > platform.centerY()) { overlapY = platform.bottom() - this.top(); }
		else { overlapY = -(this.bottom() - platform.top()); }

		if (overlapX != 0 && overlapY != 0) {
			if (Math.abs(overlapY) < Math.abs(overlapX)) {
				if (overlapY < 0.0) {
					if (this.velocityY > 0.0) {
						if (platform.id == 1 || platform.id == 3) {
							if (inputList.indexOf(32) == -1) { this.canJump = true; }
							this.onGround = true;
							this.rectangle.y += overlapY;
							this.velocityY = 0;
						}
						if (platform.id == 2) {
							this.velocityY = -this.jumpSpeed * 1.8;
						}
					}
				}
				else {
					if (this.velocityY < 0) {
						if (this.checkCollisionBottom(platform)) {
							this.rectangle.y += overlapY;
							this.velocityY = 0;
						}
					}
				}
			}
			else {
				this.rectangle.x += overlapX;
				this.velocityX = 0;
			}
		}
	}
}