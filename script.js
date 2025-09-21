/* script.js
   Tic Tac Toe with:
   - dynamic winning line (always visible in correct place)
   - popup for win/draw
   - sounds (click/win/draw/reset)
   - improved UI classes for X/O and animation
*/

console.log("Tic Tac Toe: improved");

const clickSound = new Audio("images/click.mp3");     // click on cell
const winSound   = new Audio("sounds/win.mp3");       // win
const drawSound  = new Audio("sounds/draw.mp3");      // draw
const resetSound = new Audio("sounds/reset.mp3");     // reset

// preload
[clickSound, winSound, drawSound, resetSound].forEach(a => { a.preload = "auto"; a.volume = 0.9; });

let turn = "X";
let isgameover = false;

const board = document.getElementById("board");
const boxes = Array.from(document.querySelectorAll(".box"));
const winLine = document.getElementById("winLine");
const player1El = document.getElementById("player1");
const player2El = document.getElementById("player2");
const resetBtn = document.getElementById("resetBtn");

const popup = document.getElementById("winnerPopup");
const winnerMessage = document.getElementById("winnerMessage");
const winnerSub = document.getElementById("winnerSub");
const closePopup = document.getElementById("closePopup");
const playAgain = document.getElementById("playAgain");

// winning index combos
const wins = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

// helper: update player UI
function updateTurnUI(){
  if(turn === "X"){
    player1El.classList.add("active");
    player2El.classList.remove("active");
    player1El.querySelector(".turn-indicator").innerText = "X Turn";
    player2El.querySelector(".turn-indicator").innerText = "Waiting...";
  } else {
    player2El.classList.add("active");
    player1El.classList.remove("active");
    player2El.querySelector(".turn-indicator").innerText = "O Turn";
    player1El.querySelector(".turn-indicator").innerText = "Waiting...";
  }
}

// change turn
const changeTurn = () => (turn === "X" ? "O" : "X");

// draw the neon line between two box centers (indices)
function drawWinLine(startIdx, endIdx){
  const startRect = boxes[startIdx].getBoundingClientRect();
  const endRect   = boxes[endIdx].getBoundingClientRect();
  const parentRect = board.getBoundingClientRect();

  // centers relative to board
  const start = {
    x: startRect.left - parentRect.left + startRect.width/2,
    y: startRect.top  - parentRect.top  + startRect.height/2
  };
  const end = {
    x: endRect.left - parentRect.left + endRect.width/2,
    y: endRect.top  - parentRect.top  + endRect.height/2
  };

  // midpoint and distance
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx*dx + dy*dy);

  // angle in degrees
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // set line styles
  winLine.style.width = `${distance + 18}px`;   // little padding
  winLine.style.left = `${midX}px`;
  winLine.style.top  = `${midY}px`;
  winLine.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  winLine.style.opacity = "1";
}

// hide the line
function hideWinLine(){
  winLine.style.opacity = "0";
  winLine.style.width = `0px`;
}

// check for a win/draw
function checkWin(){
  const boxtext = boxes.map(b => b.querySelector(".boxtext").innerText.trim());
  let winner = null;
  let winCombo = null;

  wins.forEach(combo => {
    const [a,b,c] = combo;
    if(boxtext[a] !== "" && boxtext[a] === boxtext[b] && boxtext[b] === boxtext[c]){
      winner = boxtext[a]; // "X" or "O"
      winCombo = combo;
    }
  });

  if(winner && winCombo){
    isgameover = true;
    // highlight the boxes
    winCombo.forEach(i => {
      boxes[i].classList.add("win");
    });

    // draw line between first and last of combo
    drawWinLine(winCombo[0], winCombo[2]);

    // popup and sound
    const who = (winner === "X") ? "Player 1 (X)" : "Player 2 (O)";
    winnerMessage.innerText = `${who} Wins! 🎉`;
    winnerSub.innerText = `Nice! ${who} played well.`;
    showPopup();
    winSound.currentTime = 0;
    winSound.play();
    return true;
  }

  // draw detection
  const isDraw = boxtext.every(t => t !== "");
  if(!isgameover && isDraw){
    isgameover = true;
    hideWinLine();
    winnerMessage.innerText = `It's a Draw!`;
    winnerSub.innerText = `No winners this round. Try again.`;
    showPopup();
    drawSound.currentTime = 0;
    drawSound.play();
    return false;
  }

  return false;
}

// show popup
function showPopup(){
  popup.setAttribute("aria-hidden", "false");
  popup.style.display = "flex";
  setTimeout(()=> popup.style.opacity = "1", 10);
}

// hide popup
function hidePopup(){
  popup.setAttribute("aria-hidden", "true");
  popup.style.opacity = "0";
  setTimeout(()=> popup.style.display = "none", 260);
}

// set up click listeners on boxes
boxes.forEach((box, idx) => {
  box.addEventListener("click", () => {
    if(isgameover) return;                          // no moves after gameover
    const textEl = box.querySelector(".boxtext");
    if(textEl.innerText.trim() !== "") return;     // already filled

    // place mark
    textEl.innerText = turn;
    box.classList.add(turn === "X" ? "x" : "o");
    box.classList.add("show");
    clickSound.currentTime = 0;
    clickSound.play();

    // check win/draw
    const hadWinner = checkWin();
    if(!isgameover){
      // change turn only if no winner
      turn = changeTurn();
      updateTurnUI();
    }
  });
});

// Reset board
function resetBoard(){
  boxes.forEach(b => {
    b.classList.remove("x","o","win","show");
    b.querySelector(".boxtext").innerText = "";
  });
  turn = "X";
  isgameover = false;
  hideWinLine();
  updateTurnUI();
}

// Reset button
resetBtn.addEventListener("click", () => {
  resetSound.currentTime = 0;
  resetSound.play();
  hidePopup();
  resetBoard();
});

// popup buttons
closePopup.addEventListener("click", () => {
  hidePopup();
});
playAgain.addEventListener("click", () => {
  hidePopup();
  resetBoard();
});

// init UI
updateTurnUI();
hideWinLine();
popup.style.display = "none";
