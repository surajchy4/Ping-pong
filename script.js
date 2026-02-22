// Game settings
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const playerScoreElem = document.getElementById('playerScore');
const computerScoreElem = document.getElementById('computerScore');

const W = canvas.width;
const H = canvas.height;

const paddleHeight = 80;
const paddleWidth = 14;
const ballRadius = 10;

let player = { x: 20,    y: H/2 - paddleHeight/2, dy: 0, speed: 5, score: 0 };
let computer = { x: W-20-paddleWidth, y: H/2-paddleHeight/2, speed: 4, score: 0 };
let ball = {
  x: W/2, y: H/2, dx: 5 * (Math.random() > 0.5 ? 1 : -1), dy: 3 * (Math.random()*2-1),
  radius: ballRadius
};

// Mouse & keyboard input
let mouseY = player.y + paddleHeight/2;
let upPressed = false, downPressed = false;

// Handle mouse movement
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mY = e.clientY - rect.top;
  player.y = Math.min(Math.max(mY - paddleHeight/2, 0), H - paddleHeight);
  mouseY = mY;
});
// Handle keyboard movement
document.addEventListener('keydown', function(e){
  if (e.code === 'ArrowUp') upPressed = true;
  if (e.code === 'ArrowDown') downPressed = true;
});
document.addEventListener('keyup', function(e){
  if (e.code === 'ArrowUp') upPressed = false;
  if (e.code === 'ArrowDown') downPressed = false;
});

// Draw functions
function drawRect(x, y, w, h, color="#fff") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, color="#fff") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}
function drawNet() {
  ctx.strokeStyle = '#888';
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(W/2, 0);
  ctx.lineTo(W/2, H);
  ctx.stroke();
  ctx.setLineDash([]);
}
function draw() {
  // Clear
  ctx.clearRect(0, 0, W, H);
  // Net
  drawNet();
  // Paddles
  drawRect(player.x, player.y, paddleWidth, paddleHeight);
  drawRect(computer.x, computer.y, paddleWidth, paddleHeight);
  // Ball
  drawCircle(ball.x, ball.y, ball.radius);
}

// Collision detection
function collide(p, b) {
  // Paddle (p): x, y, paddleWidth, paddleHeight
  // Ball (b): x, y, radius
  return (
    b.x + b.radius > p.x &&
    b.x - b.radius < p.x + paddleWidth &&
    b.y + b.radius > p.y &&
    b.y - b.radius < p.y + paddleHeight
  );
}

// Game update
function updatePlayer() {
  // Move player with keys, if pressed
  if (upPressed)    player.y -= player.speed;
  if (downPressed)  player.y += player.speed;
  // Clamp position
  player.y = Math.min(Math.max(player.y, 0), H - paddleHeight);
}
function updateComputer() {
  // Basic AI: Move towards the ball, with some speed
  let target = ball.y - paddleHeight/2;
  let delta = target - computer.y;
  if (Math.abs(delta) > 4) {
    computer.y += Math.sign(delta) * computer.speed;
  }
  // Clamp position
  computer.y = Math.min(Math.max(computer.y, 0), H - paddleHeight);
}
function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top and bottom collision
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy = -ball.dy;
  }
  if (ball.y + ball.radius > H) {
    ball.y = H - ball.radius;
    ball.dy = -ball.dy;
  }

  // Paddle collision
  if (collide(player, ball)) {
    ball.x = player.x + paddleWidth + ball.radius;
    let relativeY = (ball.y - (player.y + paddleHeight/2)) / (paddleHeight/2);
    ball.dx = Math.abs(ball.dx);
    ball.dy = 5 * relativeY;
  }
  if (collide(computer, ball)) {
    ball.x = computer.x - ball.radius;
    let relativeY = (ball.y - (computer.y + paddleHeight/2)) / (paddleHeight/2);
    ball.dx = -Math.abs(ball.dx);
    ball.dy = 5 * relativeY;
  }

  // Score check
  if (ball.x - ball.radius < 0) {
    // Computer scores
    computer.score++;
    resetBall(-1);
  }
  if (ball.x + ball.radius > W) {
    // Player scores
    player.score++;
    resetBall(1);
  }
}

function resetBall(direction) {
  ball.x = W/2;
  ball.y = H/2;
  ball.dx = 5 * (direction || (Math.random() > 0.5 ? 1 : -1));
  ball.dy = 3 * (Math.random()*2-1);
  updateScore();
}
function updateScore() {
  playerScoreElem.textContent = player.score;
  computerScoreElem.textContent = computer.score;
}

// Main game loop
function gameLoop() {
  updatePlayer();
  updateComputer();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
updateScore();
gameLoop();