const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;
const TICK_MS = 110;

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
};

let snake, dir, nextDir, food, score, timer, state; // state: "ready" | "running" | "paused" | "over"
let best = Number(localStorage.getItem("snake-best")) || 0;
bestEl.textContent = best;

function reset() {
  const midX = Math.floor(COLS / 2);
  const midY = Math.floor(ROWS / 2);
  snake = [{ x: midX, y: midY }, { x: midX - 1, y: midY }, { x: midX - 2, y: midY }];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  score = 0;
  scoreEl.textContent = score;
  placeFood();
  state = "ready";
  draw();
}

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
  // The tail moves away this tick unless we eat, so ignore it in the self-collision check.
  const hitSelf = snake.slice(0, -1).some(s => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) return gameOver();

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#4ade80" : "#22c55e";
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
  });
}

function start() {
  state = "running";
  overlay.classList.add("hidden");
  clearInterval(timer);
  timer = setInterval(step, TICK_MS);
}

function pause() {
  state = "paused";
  clearInterval(timer);
  showMessage("Paused — press Space to resume");
}

function gameOver() {
  state = "over";
  clearInterval(timer);
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem("snake-best", best);
  }
  showMessage(`Game over! Score: ${score}<br>Press Space to play again`);
}

function showMessage(html) {
  message.innerHTML = html;
  overlay.classList.remove("hidden");
}

document.addEventListener("keydown", e => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  if (key === " ") {
    e.preventDefault();
    if (state === "running") pause();
    else if (state === "over") { reset(); start(); }
    else start();
    return;
  }

  const d = DIRECTIONS[key];
  if (!d) return;
  e.preventDefault();
  // Don't allow reversing straight into yourself.
  if (d.x === -dir.x && d.y === -dir.y) return;
  nextDir = d;
  if (state === "ready") start();
});

reset();
