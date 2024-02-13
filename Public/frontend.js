import { UI } from "./Game/UI.js";
import { Game } from "./Game/app.js";
import { PLAYERS, STATE, BASE_POSITIONS } from "./Game/constants.js";
const socket = io();

// Code for canvas
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let started = false;
let parent = canvas.parentNode;
var window_height = window.innerHeight;
var window_width = window.innerWidth;
canvas.width = window_width;
canvas.height = window_height;
const text = "Press Any key To Start The Game";
context.font = "25px Arial";
context.fillStyle = "#fff";
context.fillText(text, 20, 100);
context.textAlign = "center";
canvas.style.background = "#282828";
let diceValue;
let frontEndPositions = {
  P1: [],
  P2: [],
};
let frontendPlayers = PLAYERS;
var _Game;

document.addEventListener("keyup", () => {
  if (started === false) {
    parent.removeChild(canvas);
    _Game = new Game();
    //
    // this statement actually fixes a bug that seems quite bugging only at
    // the starting of the game and doesnt bother further
    // The bug was that when game is started i was able to click on both
    // player's windows (dice btn) regardless of their turn but this line of code
    // fixes that stuff
    // \/ \/ \/
    _Game.increamentTurn();
    frontEndPositions = _Game.currentPositions;

    diceValue = _Game._diceValue;

    started = true;
  }
});

socket.on("updatedPositions", (updatedPositions) => {
  _Game.currentPositions[updatedPositions.player][updatedPositions.piece] =
    updatedPositions.newPosition;

  frontEndPositions = updatedPositions;

  UI.setPiecePosition(
    updatedPositions.player,
    updatedPositions.piece,
    updatedPositions.newPosition
  );
  UI.setDiceValue("");
});

socket.on("diceValue", (diceValue) => {
  UI.setDiceValue(diceValue);
});

socket.on("setTurn", ({ turn, PLAYERS }) => {
  // <><> 3rd <><> >==> To set turn of player
  //                    By default Player 1 will be allowed to roll first
  //PLAYERS --> from backend with their socket id
  //
  //this will internally set the turn of the player
  _Game.turn = turn;
  _Game.state = STATE.DICE_NOT_ROLLED;

  if (socket.id !== PLAYERS[frontendPlayers[turn]]) {
    UI.disableDice();
  }
});

socket.on("setScore", (Score, player, text) => {
  _Game.score[player] = Score;
  UI.setScore(player, Score);
  UI.setLead(text);
});

socket.on("Winner", (player) => {
  alert(`${player} Has Won`);
});

socket.on("resetGame", () => {
  // this is basically is resetGame from _Game object but we cant just directly
  // execute _Game.resetGame() because it will create an infinite loop
  _Game.currentPositions = structuredClone(BASE_POSITIONS);
  frontEndPositions = currentPositions;
  PLAYERS.forEach((player) => {
    [0, 1, 2, 3, 4, 5, 6].forEach((piece) => {
      _Game.setPiecePosition(
        player,
        piece,
        _Game.currentPositions[player][piece]
      );
    });
  });

  //first player P1 => will be allowed to roll first
  _Game.turn = 0;
  _Game.state = STATE.DICE_NOT_ROLLED;
  PLAYERS.forEach((player) => {
    _Game.score[player] = 0;
    UI.setScore(player, 0);
  });
});
