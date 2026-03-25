const ROWS = 9;
const COLS = 9;
const MINES = 10;

let board = [];
let gameOver = false;
let timer = 0;
let timerInterval;

function init() {
  board = [];
  gameOver = false;
  timer = 0;

  document.getElementById("timer").textContent = "000";
  document.getElementById("face").textContent = "😊";

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent =
      String(timer).padStart(3, "0");
  }, 1000);

  const boardDiv = document.getElementById("board");
  boardDiv.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;
  boardDiv.innerHTML = "";

  for (let r = 0; r < ROWS; r++) {
    board[r] = [];

    for (let c = 0; c < COLS; c++) {
      const el = document.createElement("div");
      el.className = "cell";

      const cell = {
        mine: false,
        open: false,
        flag: false,
        count: 0,
        el
      };

      // 右クリック（PC）
      el.oncontextmenu = (e) => {
        e.preventDefault();
        if (!cell.open) {
          cell.flag = !cell.flag;
          el.classList.toggle("flag");
          updateMineCount();
        }
      };

      // スマホ長押し
      let pressTimer;
      el.addEventListener("touchstart", () => {
        pressTimer = setTimeout(() => {
          if (!cell.open) {
            cell.flag = !cell.flag;
            el.classList.toggle("flag");
            updateMineCount();
          }
        }, 400);
      });
      el.addEventListener("touchend", () => clearTimeout(pressTimer));

      el.onclick = () => openCell(r, c);

      boardDiv.appendChild(el);
      board[r][c] = cell;
    }
  }

  // 地雷配置
  let placed = 0;
  while (placed < MINES) {
    let r = Math.floor(Math.random() * ROWS);
    let c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // 数字
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr;
          let nc = c + dc;
          if (board[nr] && board[nr][nc]?.mine) count++;
        }
      }
      board[r][c].count = count;
    }
  }

  updateMineCount();
}

function updateMineCount() {
  let flags = 0;
  board.flat().forEach(c => { if (c.flag) flags++; });

  let remain = MINES - flags;
  document.getElementById("mineCount").textContent =
    String(remain).padStart(3, "0");
}

function openCell(r, c) {
  const cell = board[r][c];
  if (cell.open || cell.flag || gameOver) return;

  document.getElementById("face").textContent = "😮";

  cell.open = true;
  cell.el.classList.add("open");

  if (cell.mine) {
    cell.el.classList.add("mine");
    document.getElementById("face").textContent = "😵";
    revealMines();
    gameOver = true;
    clearInterval(timerInterval);
    return;
  }

  if (cell.count > 0) {
    cell.el.textContent = cell.count;
    cell.el.classList.add("n" + cell.count);
  } else {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr;
        let nc = c + dc;
        if (board[nr] && board[nr][nc]) openCell(nr, nc);
      }
    }
  }

  checkWin();
  document.getElementById("face").textContent = "😊";
}

function revealMines() {
  board.flat().forEach(c => {
    if (c.mine) c.el.classList.add("mine");
  });
}

function checkWin() {
  let safe = ROWS * COLS - MINES;
  let opened = board.flat().filter(c => c.open && !c.mine).length;

  if (opened === safe) {
    document.getElementById("face").textContent = "😎";
    clearInterval(timerInterval);
    gameOver = true;
  }
}

init();            cell.flag = !cell.flag;
            el.classList.toggle("flag");
          }
        }, 400);
      });

      el.addEventListener("touchend", () => {
        clearTimeout(pressTimer);
      });

      // 👇 タップで開く
      el.addEventListener("click", () => openCell(r, c));

      boardDiv.appendChild(el);
      board[r][c] = cell;
    }
  }

  // 地雷配置
  let placed = 0;
  while (placed < MINES) {
    let r = Math.floor(Math.random() * ROWS);
    let c = Math.floor(Math.random() * COLS);

    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // 数字計算
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;

      let count = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr;
          let nc = c + dc;

          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (board[nr][nc].mine) count++;
          }
        }
      }

      board[r][c].count = count;
    }
  }
}

function openCell(r, c) {
  const cell = board[r][c];

  if (cell.open || cell.flag || gameOver) return;

  cell.open = true;
  cell.el.classList.add("open");

  if (cell.mine) {
    cell.el.classList.add("mine");
    alert("ゲームオーバー");
    revealMines();
    gameOver = true;
    return;
  }

  if (cell.count > 0) {
    cell.el.textContent = cell.count;
  } else {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr;
        let nc = c + dc;

        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          openCell(nr, nc);
        }
      }
    }
  }

  checkWin();
}

function revealMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) {
        board[r][c].el.classList.add("mine");
      }
    }
  }
}

function checkWin() {
  let safe = ROWS * COLS - MINES;
  let opened = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].open && !board[r][c].mine) opened++;
    }
  }

  if (opened === safe) {
    alert("クリア！");
    gameOver = true;
  }
}

init();
