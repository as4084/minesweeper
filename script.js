let ROWS = 9, COLS = 9, MINES = 10;

let board = [];
let gameOver = false;
let firstClick = true;
let timer = 0;
let interval;

function setLevel(level) {
  if (level === "easy") { ROWS=9; COLS=9; MINES=10; }
  if (level === "medium") { ROWS=16; COLS=16; MINES=40; }
  if (level === "hard") { ROWS=16; COLS=30; MINES=99; }
  init();
}

function init() {
  board = [];
  gameOver = false;
  firstClick = true;
  timer = 0;

  clearInterval(interval);
  document.getElementById("timer").textContent = "000";

  const boardDiv = document.getElementById("board");
  boardDiv.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;
  boardDiv.innerHTML = "";

  for (let r=0;r<ROWS;r++) {
    board[r]=[];
    for (let c=0;c<COLS;c++) {
      const el=document.createElement("div");
      el.className="cell";

      const cell={mine:false,open:false,flag:false,count:0,el};

      el.oncontextmenu=(e)=>{
        e.preventDefault();
        if (!cell.open) {
          cell.flag=!cell.flag;
          cell.el.textContent = cell.flag ? "🚩" : "";
          updateMineCount();
        }
      };

      el.onclick=()=>openCell(r,c);

      boardDiv.appendChild(el);
      board[r][c]=cell;
    }
  }

  updateMineCount();
}

function placeMines(safeR,safeC){
  let placed=0;
  while(placed<MINES){
    let r=Math.floor(Math.random()*ROWS);
    let c=Math.floor(Math.random()*COLS);
    if(!board[r][c].mine && !(r===safeR && c===safeC)){
      board[r][c].mine=true;
      placed++;
    }
  }

  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      let count=0;
      for(let dr=-1;dr<=1;dr++){
        for(let dc=-1;dc<=1;dc++){
          let nr=r+dr,nc=c+dc;
          if(board[nr]?.[nc]?.mine) count++;
        }
      }
      board[r][c].count=count;
    }
  }
}

function openCell(r,c){
  const cell=board[r][c];
  if(cell.open||cell.flag||gameOver) return;

  if(firstClick){
    placeMines(r,c);
    startTimer();
    firstClick=false;
  }

  cell.open=true;
  cell.el.classList.add("open");

  if(cell.mine){
    cell.el.textContent="💣";
    cell.el.classList.add("explode");
    revealMines();
    gameOver=true;
    saveScore(false);
    return;
  }

  if(cell.count>0){
    cell.el.textContent=cell.count;
    cell.el.classList.add("n"+cell.count);
  } else {
    for(let dr=-1;dr<=1;dr++){
      for(let dc=-1;dc<=1;dc++){
        openCell(r+dr,c+dc);
      }
    }
  }

  checkWin();
}

function revealMines(){
  board.flat().forEach(c=>{
    if(c.mine) c.el.textContent="💣";
  });
}

function updateMineCount(){
  let flags=board.flat().filter(c=>c.flag).length;
  let remain=MINES-flags;
  document.getElementById("mineCount").textContent=
    String(remain).padStart(3,"0");
}

function startTimer(){
  interval=setInterval(()=>{
    timer++;
    document.getElementById("timer").textContent=
      String(timer).padStart(3,"0");
  },1000);
}

function checkWin(){
  let safe=ROWS*COLS-MINES;
  let opened=board.flat().filter(c=>c.open&&!c.mine).length;

  if(opened===safe){
    gameOver=true;
    clearInterval(interval);
    saveScore(true);
  }
}

/* ランキング */
function saveScore(win){
  if(!win) return;
  let scores=JSON.parse(localStorage.getItem("scores")||"[]");
  scores.push(timer);
  scores.sort((a,b)=>a-b);
  scores=scores.slice(0,5);
  localStorage.setItem("scores",JSON.stringify(scores));
  renderRanking();
}

function renderRanking(){
  let scores=JSON.parse(localStorage.getItem("scores")||"[]");
  let list=document.getElementById("rankingList");
  list.innerHTML="";
  scores.forEach(s=>{
    let li=document.createElement("li");
    li.textContent=s+"秒";
    list.appendChild(li);
  });
}

init();
renderRanking();
