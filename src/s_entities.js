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