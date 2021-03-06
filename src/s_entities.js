function Platform(id, position, width, height, color = [255,255,255,255]) {
	this.id = id;
	this.rectangle = new Rectangle(position[0], position[1], width, height, color);

	this.top = () => { return this.rectangle.y; }
	this.bottom = () => { return this.rectangle.y + this.rectangle.height; }
	this.left = () => { return this.rectangle.x; }
	this.right = () => { return this.rectangle.x + this.rectangle.width; }

	this.centerX = () => { return this.rectangle.x + (this.rectangle.width / 2); }
	this.centerY = () => { return this.rectangle.y + (this.rectangle.height / 2); }

	this.draw = () => {
		this.rectangle.draw();
	}
}

function Gateway(position, width, height) {
	this.id = 3;
	this.currentState = 0;
	this.rectangle = new RectangleTextured(position[0], position[1], width, height, this.currentState);

	this.top = () => { return this.rectangle.y; }
	this.bottom = () => { return this.rectangle.y + this.rectangle.height; }
	this.left = () => { return this.rectangle.x; }
	this.right = () => { return this.rectangle.x + this.rectangle.width; }

	this.centerX = () => { return this.rectangle.x + (this.rectangle.width / 2); }
	this.centerY = () => { return this.rectangle.y + (this.rectangle.height / 2); }

	this.incrementState = () => {
		if (this.currentState == 2) {
			this.currentState = -1;
		}
		else { this.currentState += 1; }
		this.rectangle.updateIndex(this.currentState);
	}

	this.draw = () => {
		this.rectangle.draw();
	}
}

function GatewayDrop(position, width, height) {
	this.id = 4;
	this.isEnabled = false;
	this.rectangle = new RectangleTextured(position[0], position[1], width, height, 4);

	this.top = () => { return this.rectangle.y; }
	this.bottom = () => { return this.rectangle.y + this.rectangle.height; }
	this.left = () => { return this.rectangle.x; }
	this.right = () => { return this.rectangle.x + this.rectangle.width; }

	this.centerX = () => { return this.rectangle.x + (this.rectangle.width / 2); }
	this.centerY = () => { return this.rectangle.y + (this.rectangle.height / 2); }

	this.enable = () => {
		if (!this.isEnabled) {
			this.rectangle.updateIndex(5);
			this.isEnabled = true;
		}
	}

	this.disable = () => {
		if (this.isEnabled) {
			this.rectangle.updateIndex(4);
			this.isEnabled = false;
		}
	}

	this.draw = () => {
		this.rectangle.draw();
	}
}

function Marker(position) {
	this.rectangle = new RectangleTextured(position[0], position[1], 40, 40, 3);

	this.setPosition = (position) => {
		this.rectangle.x = position[0];
		this.rectangle.y = position[1];
	}

	this.top = () => { return this.rectangle.y; }
	this.bottom = () => { return this.rectangle.y + this.rectangle.height; }
	this.left = () => { return this.rectangle.x; }
	this.right = () => { return this.rectangle.x + this.rectangle.width; }

	this.centerX = () => { return this.rectangle.x + (this.rectangle.width / 2); }
	this.centerY = () => { return this.rectangle.y + (this.rectangle.height / 2); }

	this.draw = () => {
		this.rectangle.draw();
	}
}