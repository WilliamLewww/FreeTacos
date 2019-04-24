const GRAVITY = 0.2;

function Player(position, width, height, color = [255,0,0,255]) {
	this.rectangle = new Rectangle(position[0], position[1], width, height, color);
	this.velocityX = 0;
	this.velocityY = 0;
	this.onGround = false;
	this.canJump = false;

	this.previousX = 0;
	this.previousY = 0;

	this.moveSpeed = 2.5;
	this.jumpHeight = 5;

	this.top = () => { return this.rectangle.y; }
	this.bottom = () => { return this.rectangle.y + this.rectangle.height; }
	this.left = () => { return this.rectangle.x; }
	this.right = () => { return this.rectangle.x + this.rectangle.width; }

	this.centerX = () => { return this.rectangle.x + (this.rectangle.width / 2); }
	this.centerY = () => { return this.rectangle.y + (this.rectangle.height / 2); }

	this.update = () => {
		this.velocityX = 0;
		if (inputList.indexOf(37) != -1 && inputList.indexOf(39) == -1 && this.left() > 0) { this.velocityX = -this.moveSpeed; }
		if (inputList.indexOf(37) == -1 && inputList.indexOf(39) != -1 && this.right() < SCREEN_WIDTH) { this.velocityX = this.moveSpeed; }

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
				this.velocityY = -this.jumpHeight;
			}
		}

		this.previousX = this.rectangle.x;
		this.previousY = this.rectangle.y;

		this.rectangle.x += this.velocityX;
		this.rectangle.y += this.velocityY;

		if (this.previousX != this.rectangle.x || this.previousY != this.rectangle.y) {
			sendPosition();
		}

		this.onGround = false;
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
						if (platform.id == 1) {
							if (inputList.indexOf(32) == -1) { this.canJump = true; }
							this.onGround = true;
							this.rectangle.y += overlapY;
							this.velocityY = 0;
						}
						if (platform.id == 2) {
							this.velocityY = -this.jumpHeight * 1.8;
						}
					}
				}
				else {
					if (this.velocityY < 0) {
						this.rectangle.y += overlapY;
						this.velocityY = 0;
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