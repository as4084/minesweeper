let ROWS = 9, COLS = 9, MINES = 10;

let board = [];
let gameOver = false;
let firstClick = true;
let timer = 0;
let interval;
let winHandled = false;

/* 難易度 */
function setLevel(level) {
  if (level === "easy") {
    ROWS = 9; COLS = 9; MINES = 10;
    document.body.classList.remove("landscape");
  }

  if (level === "medium") {
    ROWS = 16; COLS = 16; MINES = 40;
    document.body.classList.remove("landscape");
  }

  if (level === "hard") {
    ROWS = 16; COLS = 30; MINES = 99;
    document.body.classList.add("landscape");
  }

  init();
  renderRanking();
}

/* 初期化 */
function init() {
  board = [];
  gameOver = false;
  firstClick = true;
  timer = 0;
  winHandled = false;

  document.querySelector(".face").textContent = "🙂";

  clearInterval(interval);
  document.getElementById("timer").textContent = "000";

  const boardDiv = document.getElementById("board");
  boardDiv.style.gridTemplateColumns = `repeat(${COLS}, min(30px, 8vw))`;
  boardDiv.innerHTML = "";

  for (let r = 0; r < ROWS; r++) {
    board[r] = [];

    for (let c = 0; c < COLS; c++) {
      const el = document.createElement("div");
      el.className = "cell";

      const cell = { mine:false, open:false, flag:false, count:0, el };

      el.oncontextmenu = (e) => {
        e.preventDefault();
        if (!cell.open && !gameOver) {
          cell.flag = !cell.flag;
          el.textContent = cell.flag ? "🚩" : "";
          updateMineCount();
        }
      };

      el.onclick = () => openCell(r, c);

      boardDiv.appendChild(el);
      board[r][c] = cell;
    }
  }

  updateMineCount();
  renderRanking();
}

/* 地雷配置（初手安全） */
function placeMines(sr, sc) {
  let placed = 0;

  while (placed < MINES) {
    let r = Math.floor(Math.random() * ROWS);
    let c = Math.floor(Math.random() * COLS);

    if (!board[r][c].mine && !(r === sr && c === sc)) {
      board[r][c].mine = true;
      placed++;
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let count = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (board[r+dr]?.[c+dc]?.mine) count++;
        }
      }

      board[r][c].count = count;
    }
  }
}

/* 開く */
function openCell(r, c) {
  document.querySelector(".face").textContent = "😮";
  
  if (!board[r] || !board[r][c]) return;

  const cell = board[r][c];
  if (cell.open || cell.flag || gameOver) return;

  if (firstClick) {
    placeMines(r, c);
    startTimer();
    firstClick = false;
  }

  cell.open = true;
  cell.el.classList.add("open");

  if (cell.mine) {
    cell.el.textContent = "💣";
    cell.el.classList.add("explode");
    document.querySelector(".face").textContent = "😵‍💫";

    revealMines();
    gameOver = true;
    clearInterval(interval);
    return;
  }

  if (cell.count > 0) {
    cell.el.textContent = cell.count;
    cell.el.classList.add("n" + cell.count);
  } else {
    for (let dr=-1; dr<=1; dr++) {
      for (let dc=-1; dc<=1; dc++) {
        openCell(r+dr, c+dc);
      }
    }
  }

  setTimeout(checkWin, 0);
  if (!gameOver) {
  document.querySelector(".face").textContent = "🙂";
  }
}

/* 地雷表示 */
function revealMines() {
  board.flat().forEach(c => {
    if (c.mine) c.el.textContent = "💣";
  });
}

/* 残数 */
function updateMineCount() {
  let flags = board.flat().filter(c=>c.flag).length;
  document.getElementById("mineCount").textContent =
    String(MINES - flags).padStart(3,"0");
}

/* タイマー */
function startTimer() {
  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent =
      String(timer).padStart(3,"0");
  }, 1000);
}

/* 勝利判定 */
function checkWin() {
  if (gameOver || winHandled) return;

  let opened = board.flat().filter(c=>c.open && !c.mine).length;

  if (opened === ROWS*COLS - MINES) {
    gameOver = true;
    winHandled = true;
    clearInterval(interval);

    document.querySelector(".face").textContent = "😎";
    saveScore(true);
  }
}

/* スコア */
function saveScore(win) {
  if (!win) return;

  const name = prompt("名前を入力してください","プレイヤー") || "名無し";
  const key = `${ROWS}x${COLS}`;

  let scores = JSON.parse(localStorage.getItem(key) || "[]");

  scores.push({name, time: timer});
  scores.sort((a,b)=>a.time-b.time);
  scores = scores.slice(0,5);

  localStorage.setItem(key, JSON.stringify(scores));
  renderRanking();
}

/* 表示 */
function renderRanking() {
  const key = `${ROWS}x${COLS}`;
  let scores = JSON.parse(localStorage.getItem(key) || "[]");

  const list = document.getElementById("rankingList");
  list.innerHTML = "";

  scores.forEach((s,i)=>{
    let li = document.createElement("li");
    li.innerHTML = `
      <span class="rank">${i+1}位</span>
      <span class="name">${s.name}</span>
      <span class="time">${s.time}秒</span>
    `;
    list.appendChild(li);
  });
}

init();
