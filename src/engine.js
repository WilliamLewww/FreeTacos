var SCREEN_WIDTH = 1000;
var SCREEN_HEIGHT = 600;
var scaleX, scaleY, scaleMin;

var gl;
var programList = [];

var joiner;
var mainReq;

var textureCount = 50;
var textureSheet = false;
var texture;
function initializeTextures() {
  textureSheet = new Image();
  textureSheet.src = "res/texture_sheet.png";
  textureSheet.addEventListener('load', function() {
	  socket = io.connect('https://freetacos.herokuapp.com');
	  createClientListeners();
	  createListeners();
  });
}

function initialize() {
  if (loadingTextExists) {
	document.getElementById("loading-text").remove();
    document.getElementById("loading-text2").remove();
    loadingTextExists = false;
  }

  var canvas = document.getElementById("glCanvas");
  gl = canvas.getContext("experimental-webgl");
  
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, textureSheet);

  resize();

  programList.push(createProgram(VERTEX_SHADER_1, FRAGMENT_SHADER_1));
  programList.push(createProgram(VERTEX_SHADER_2, FRAGMENT_SHADER_2));

  joiner = new Joiner();
  joiner.initialize();

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  mainLoop();
}

var frameEnd = 0, deltaTime = 0;
function mainLoop(frameStart) {
  mainReq = requestAnimationFrame(mainLoop);

  deltaTime = frameStart - frameEnd;
  frameEnd = frameStart;

  if (deltaTime < 75.0) {
    update(deltaTime);
    draw();
  }
}

function update(elapsedTimeMS) {
  joiner.update(elapsedTimeMS);
}

function draw() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  joiner.draw();
}

function resize() {
  scaleX = (window.innerWidth / (SCREEN_WIDTH + 50));
  scaleY = (window.innerHeight / (SCREEN_HEIGHT + 50));
  scaleMin = Math.min(scaleX, scaleY);

  if (scaleMin <= 1.0) {
    gl.canvas.width = (SCREEN_WIDTH * scaleMin);
    gl.canvas.height = (SCREEN_HEIGHT * scaleMin);
  }
  else {
  scaleMin = 1.0;
    gl.canvas.width = SCREEN_WIDTH;
    gl.canvas.height = SCREEN_HEIGHT;
  }
}

function createProgram(vertexSource, fragmentSource) {
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.shaderSource(fragmentShader, fragmentSource);

  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
}

var isFocused = true;
var inputList = [];
var loadingTextExists = true;
function createListeners() {
  document.addEventListener('focus', event => { 
    isFocused = true; 
  });
  document.addEventListener('blur', event => { isFocused = false; });

  document.addEventListener('keydown', event => {
    if ([32, 37, 38, 39, 40].indexOf(event.keyCode) != -1) { event.preventDefault(); }
    if (inputList.indexOf(event.keyCode) == -1) { inputList.push(event.keyCode); }
  });

  document.addEventListener('keyup', event => {
    inputList.splice(inputList.indexOf(event.keyCode), 1);
  });
}