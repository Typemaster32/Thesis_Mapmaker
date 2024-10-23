let cats = [];
let particles = [];
let showTicTacToe = false; // To toggle between bouncing cats and Tic-Tac-Toe
let board;
let currentPlayer;
let gameOver = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  createCatEnvironment();
  createTicTacToe();
}

function draw() {
  background(30);

  if (!showTicTacToe) {
    // Bouncing Cat Environment
    updateCatEnvironment();
  } else {
    // Tic Tac Toe Game
    displayTicTacToe();
  }
}

// Toggle between bouncing cats and Tic-Tac-Toe on key press
function keyPressed() {
  if (key === " ") {
    showTicTacToe = !showTicTacToe;
  }
}

// Create and initialize cat environment
function createCatEnvironment() {
  for (let i = 0; i < 5; i++) {
    cats.push(new Cat(random(width), random(height), random(50, 80))); // Larger size for cat illustrations
  }
}

function updateCatEnvironment() {
  // Update and display all cats
  for (let i = cats.length - 1; i >= 0; i--) {
    cats[i].move();
    cats[i].display();

    // Check for collisions between cats
    for (let j = i + 1; j < cats.length; j++) {
      if (cats[i].intersects(cats[j])) {
        createParticleEffect(cats[i].x, cats[i].y);
      }
    }
  }

  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

// Add a new cat on mouse press
function mousePressed() {
  if (!showTicTacToe) {
    cats.push(new Cat(mouseX, mouseY, random(50, 80))); // Larger size for cat illustrations
  } else if (!gameOver && mouseX < width && mouseY < height) {
    let x = floor(mouseX / (width / 3));
    let y = floor(mouseY / (height / 3));
    if (board[x][y] === "") {
      board[x][y] = currentPlayer;
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      checkWinner();
    }
  }
}

// Cat class for bouncing cat environment
class Cat {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.dx = random(-4, 4);
    this.dy = random(-4, 4);
  }

  move() {
    // Movement and bounce
    this.x += this.dx;
    this.y += this.dy;

    if (this.x + this.size > width || this.x < 0) {
      this.dx *= -1;
    }
    if (this.y + this.size > height || this.y < 0) {
      this.dy *= -1;
    }
  }

  display() {
    drawCat(this.x, this.y, this.size); // Call the cat drawing function
  }

  // Check for intersection between two cats
  intersects(other) {
    let distance = dist(this.x, this.y, other.x, other.y);
    return distance < this.size;
  }
}

// Function to draw a simple illustrated cat
function drawCat(x, y, size) {
  let faceSize = size * 0.7;
  let earSize = size * 0.3;
  let eyeSize = size * 0.1;

  // Draw ears
  fill(200, 100, 100);
  triangle(
    x - faceSize * 0.4,
    y - faceSize * 0.5,
    x - earSize,
    y - faceSize,
    x,
    y - faceSize * 0.7
  );
  triangle(
    x + faceSize * 0.4,
    y - faceSize * 0.5,
    x + earSize,
    y - faceSize,
    x,
    y - faceSize * 0.7
  );

  // Draw face
  fill(255, 200, 200);
  ellipse(x, y, faceSize);

  // Draw eyes
  fill(0);
  ellipse(x - faceSize * 0.2, y - faceSize * 0.1, eyeSize);
  ellipse(x + faceSize * 0.2, y - faceSize * 0.1, eyeSize);

  // Draw nose
  fill(255, 100, 100);
  triangle(
    x,
    y,
    x - eyeSize * 0.4,
    y + eyeSize * 0.4,
    x + eyeSize * 0.4,
    y + eyeSize * 0.4
  );

  // Draw whiskers
  stroke(0);
  line(
    x - faceSize * 0.4,
    y + eyeSize * 0.2,
    x - faceSize * 0.7,
    y + eyeSize * 0.1
  );
  line(
    x - faceSize * 0.4,
    y + eyeSize * 0.3,
    x - faceSize * 0.7,
    y + eyeSize * 0.3
  );
  line(
    x + faceSize * 0.4,
    y + eyeSize * 0.2,
    x + faceSize * 0.7,
    y + eyeSize * 0.1
  );
  line(
    x + faceSize * 0.4,
    y + eyeSize * 0.3,
    x + faceSize * 0.7,
    y + eyeSize * 0.3
  );
}

// Particle class for collision effects
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(5, 10);
    this.dx = random(-2, 2);
    this.dy = random(-2, 2);
    this.life = 5; // Fades over time
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life -= 5;
  }

  display() {
    noStroke();
    fill(255, this.life);
    ellipse(this.x, this.y, this.r * 2);
  }

  // Check if particle is dead (faded)
  isDead() {
    return this.life < 0;
  }
}

// Create particle effect when cats collide
function createParticleEffect(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(x, y));
  }
}

// --- Tic-Tac-Toe Game Code ---

// Initialize the Tic-Tac-Toe game
function createTicTacToe() {
  console.log("ttt");
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  currentPlayer = "X";
}

// Display the Tic-Tac-Toe board
function displayTicTacToe() {
  stroke(255);
  strokeWeight(5);

  // Draw the grid
  line(width / 3, 0, width / 3, height);
  line((2 * width) / 3, 0, (2 * width) / 3, height);
  line(0, height / 3, width, height / 3);
  line(0, (2 * height) / 3, width, (2 * height) / 3);

  // Draw the cat illustrations for X's and O's
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let x = (width / 3) * i + width / 6;
      let y = (height / 3) * j + height / 6;
      if (board[i][j] === "X") {
        drawCat(x, y, 100); // Draw X's as a larger cat
      } else if (board[i][j] === "O") {
        drawCat(x, y, 100); // Draw O's as a larger cat
      }
    }
  }

  // Check if game is over
  if (gameOver) {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(64);
    text("Game Over", width / 2, height / 2);
  }
}

// Check for a winner in Tic-Tac-Toe
function checkWinner() {
  let winner = null;
  for (let i = 0; i < 3; i++) {
    // Horizontal
    if (
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2] &&
      board[i][0] !== ""
    ) {
      winner = board[i][0];
    }
    // Vertical
    if (
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i] &&
      board[0][i] !== ""
    ) {
      winner = board[0][i];
    }
  }

  // Diagonal
  if (
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2] &&
    board[0][0] !== ""
  ) {
    winner = board[0][0];
  }
  if (
    board[2][0] === board[1][1] &&
    board[1][1] === board[0][2] &&
    board[2][0] !== ""
  ) {
    winner = board[2][0];
  }

  // If there's a winner or a tie
  if (winner !== null) {
    gameOver = true;
  } else if (board.flat().every((cell) => cell !== "")) {
    gameOver = true; // It's a tie
  }
}
