function denormalizeColor(color) {
	return [color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, color[3] / 255.0];
}

//10x5
function getTextureCoordinates(index) {
	var coordinates = [];
	var offset = 0.005;

	if (index == 0) {
		coordinates.push(0.0 + offset);
		coordinates.push(0.2 - offset);
		coordinates.push(0.0 + offset);
		coordinates.push(0.2 - offset);
	}
	if (index == 1) {
		coordinates.push(0.2 + offset);
		coordinates.push(0.4 - offset);
		coordinates.push(0.0 + offset);
		coordinates.push(0.2 - offset);
	}
	if (index == 2) {
		coordinates.push(0.4 + offset);
		coordinates.push(0.6 - offset);
		coordinates.push(0.0 + offset);
		coordinates.push(0.2 - offset);
	}
	if (index == 3) {
		coordinates.push(0.6 + offset);
		coordinates.push(0.7 - offset);
		coordinates.push(0.0 + offset);
		coordinates.push(0.2 - offset);
	}
	if (index == 4) {
		coordinates.push(0.7 + offset);
		coordinates.push(0.8 - offset);
		coordinates.push(0.0 + offset);
		coordinates.push(0.2 - offset);
	}
	if (index == 5) {
		coordinates.push(0.8 + offset);
		coordinates.push(0.9 - offset);
		coordinates.push(0.0 + offset);
		coordinates.push(0.2 - offset);
	}
	if (index == 6) {
		coordinates.push(0.0 + offset);
		coordinates.push(0.4 - offset);
		coordinates.push(0.2 + offset);
		coordinates.push(0.6 - offset);
	}
	if (index == 7) {
		coordinates.push(0.4 + offset);
		coordinates.push(0.9 - offset);
		coordinates.push(0.2 + offset);
		coordinates.push(0.6 - offset);
	}
	if (index == 8) {
		coordinates.push(0.0 + offset);
		coordinates.push(0.5 - offset);
		coordinates.push(0.6 + offset);
		coordinates.push(1.0 - offset);
	}

	return coordinates;
}

function Rectangle(x, y, width, height, color = [255,0,0,255]) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.color = color;

	this.program = programList[0];

	this.positionAttributeLocation = gl.getAttribLocation(this.program, 'position');
	this.resolutionLocation = gl.getUniformLocation(this.program, 'resolution');
	this.scaleLocation = gl.getUniformLocation(this.program, 'scaleWindow');
	this.colorLocation = gl.getUniformLocation(this.program, 'color');

	this.positionBuffer = gl.createBuffer();

	this.draw = (x = this.x, y = this.y) => {
		gl.useProgram(this.program);
		gl.enableVertexAttribArray(this.positionAttributeLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.getPositionArray(x, y)), gl.STATIC_DRAW);
		gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
		gl.uniform2f(this.resolutionLocation, gl.canvas.width, gl.canvas.height);
		gl.uniform1f(this.scaleLocation, scaleMin);
		gl.uniform4fv(this.colorLocation, denormalizeColor(this.color));
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	this.getPositionArray = (x, y) => {
		return [
			x, y,
			x + this.width, y,
			x, y + this.height,
			x, y + this.height,
			x + this.width, y,
			x + this.width, y + this.height,
		];
	}
}

function RectangleTextured(x, y, width, height, index) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.index = index;

	this.program = programList[1];

	this.positionAttributeLocation = gl.getAttribLocation(this.program, 'position');
	this.textureAttributeLocation = gl.getAttribLocation(this.program, 'a_texture');
	this.textureLocation = gl.getUniformLocation(this.program, "u_texture");

	this.resolutionLocation = gl.getUniformLocation(this.program, 'resolution');
	this.scaleLocation = gl.getUniformLocation(this.program, 'scaleWindow');

	this.positionBuffer = gl.createBuffer();
	this.textureBuffer = gl.createBuffer();

	this.updateIndex = (index) => { this.index = index; }

	this.draw = (x = this.x, y = this.y) => {
		gl.useProgram(this.program);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(this.positionAttributeLocation);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.getPositionArray(x, y)), gl.STATIC_DRAW);
		gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
		gl.enableVertexAttribArray(this.textureAttributeLocation);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.getTextureArray()), gl.STATIC_DRAW);
		gl.vertexAttribPointer(this.textureAttributeLocation, 2, gl.FLOAT, false, 0, 0);

		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.uniform2f(this.resolutionLocation, gl.canvas.width, gl.canvas.height);
		gl.uniform1f(this.scaleLocation, scaleMin);
		gl.uniform1i(this.textureLocation, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	this.getPositionArray = (x, y) => {
		return [
			x, y,
			x, y + this.height,
			x + this.width, y,
			x + this.width, y,
			x, y + this.height,
			x + this.width, y + this.height,
		];
	}

	this.getTextureArray = () => {
		var coordinates = getTextureCoordinates(this.index);
		return [
            coordinates[0], coordinates[2],
	        coordinates[0], coordinates[3],
	        coordinates[1], coordinates[2],
	        coordinates[1], coordinates[2],
	        coordinates[0], coordinates[3],
	        coordinates[1], coordinates[3],
		];
	}
}