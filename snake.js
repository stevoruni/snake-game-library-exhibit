let imageModelURL = 'https://teachablemachine.withgoogle.com/models/IjjoFVG8X/';
let classifier;
let label = "";
let snakeImg, endImg, food, capture;
let snake = [];
let xSpeed = 0, ySpeed = 0;
let started = false;
let gameOver = false;
let showStartScreen = true; // State for showing the start screen
let scl = 20; // Scale for snake and food size

function preload() {
  snakeImg = loadImage('snake copy.jpg'); // Replace with your image path
  endImg = loadImage('end copy.jpg');     // Replace with your image path
  classifier = ml5.imageClassifier(  'https://teachablemachine.withgoogle.com/models/IjjoFVG8X/model.json');
}

function setup() {
  createCanvas(640, 420); // Set the canvas size to 640x360
  frameRate(5);
  capture = createCapture(VIDEO);
  capture.size(640, 420); // Set the capture size to match the canvas size
  capture.hide(); // Hide the video element, and just show the canvas
  snake.push(createVector(floor(width / 2), floor(height / 2)));
  pickLocation();
}

function draw() {
  background(0); // Set the background to black

  if (showStartScreen) {
    image(snakeImg, (width - 640) / 2, (height - 420) / 2, 640, 420); // Center the image on the canvas
    return;
  } else if (gameOver) {
    image(endImg, (width - 640) / 2, (height - 420) / 2, 640, 420); // Center the image on the canvas
    return;
  }

  push(); // Start a new drawing state
  translate(width, 0); // Move to the far right of the canvas
  scale(-1, 1); // Flip the canvas horizontally
  image(capture, 0, 0, width, height); // Draw the flipped video
  pop(); // Restore original state

  // Update and display the snake and food
  updateSnake();
  displaySnake();

  // Draw the food
  fill(255, 0, 100);
  rect(food.x, food.y, scl, scl);

  classifyVideo(); // Continuously classify to control the snake
}

function keyPressed() {
  if (keyCode === 32) { // Space bar
    if (gameOver) {
      gameOver = false;
      showStartScreen = true; // Show the start screen
    } else if (showStartScreen) {
      showStartScreen = false;
      started = true;
      snake = [createVector(floor(width / 2), floor(height / 2))];
      xSpeed = 0;
      ySpeed = -scl;
      pickLocation();
    }
  }
}

function classifyVideo() {
  if (started && !gameOver) {
    classifier.classify(capture, gotResults);
  }
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  controlSnake(label);
}

function controlSnake(label) {
  if (label === 'up' && ySpeed === 0) {
    xSpeed = 0;
    ySpeed = -scl;
  } else if (label === 'down' && ySpeed === 0) {
    xSpeed = 0;
    ySpeed = scl;
  } else if (label === 'left' && xSpeed === 0) {
    xSpeed = -scl;
    ySpeed = 0;
  } else if (label === 'right' && xSpeed === 0) {
    xSpeed = scl;
    ySpeed = 0;
  }
}

function pickLocation() {
  let cols = floor(width / scl);
  let rows = floor(height / scl);
  food = createVector(floor(random(cols)), floor(random(rows)));
  food.mult(scl);
}

function updateSnake() {
  let head = snake[0].copy();
  head.x += xSpeed;
  head.y += ySpeed;

  if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
    gameOver = true;
    started = false; // Set started to false when the game is over
  }

 snake.unshift(head);
  if (snake[0].x === food.x && snake[0].y === food.y) {
    pickLocation();
  } else {
    snake.pop();
  }
}

function displaySnake() {
  fill(0);
  for (let i = 0; i < snake.length; i++) {
    rect(snake[i].x, snake[i].y, scl, scl);
  }
}
