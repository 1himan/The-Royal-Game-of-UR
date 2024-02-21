import { UI } from "./UI.js";
import {
  BASE_POSITIONS,
  HOME_ENTRANCE,
  PLAYERS,
  STATE,
  START_POSITIONS,
  HOME_POSITIONS,
  SAFE_POSITIONS,
  WIN_POSITIONS,
  TRACK,
} from "./constants.js";

//try removing this "http://localhost:8000"
let socket = io("http://localhost:8000");

export class Game {
  constructor() {
    PLAYERS.forEach((player) => {
      [0, 1, 2, 3, 4, 5, 6].forEach((piece) => {
        this.setPiecePosition(player, piece, BASE_POSITIONS[player][piece]);
      });
    });

    this.turn = 1;
    this.moveTurn = false;
    this.listenDiceClick();
    this.listenPieceClick();
    this.listenResetClick();
  }
  currentPositions = {
    //to store cell number of all the pieces
    P1: [],
    P2: [],
  };
  throwCurrentPositions() {
    return this.currentPositions;
  }

  track = {
    P1: [],
    P2: [],
  };

  score = {
    P1: 0,
    P2: 0,
  };

  clickedOnce = false;

  _diceValue;
  get diceValue() {
    return this._diceValue;
  }
  set diceValue(value) {
    this._diceValue = value;

    UI.setDiceValue(value);
  }

  _turn;
  get turn() {
    return this._turn;
  }
  set turn(value) {
    this._turn = value;
    UI.setTurn(value);
  }

  _state;
  get state() {
    return this._state;
  }
  set state(value) {
    this._state = value;

    if (value === STATE.DICE_NOT_ROLLED) {
      UI.enableDice();
      UI.unhighlightPieces();
    } else {
      UI.disableDice();
    }
  }

  listenDiceClick() {
    UI.listenDiceClick(this.onDiceClick.bind(this));
  }

  onDiceClick() {
    this.diceValue = 0;
    for (var i = 0; i < 4; i++) {
      this.diceValue += Math.floor(Math.random() * 2);
    }
    this.moveTurn = true;
    this.state = STATE.DICE_ROLLED;
    if (this.diceValue == 0) {
      this.increamentTurn();
      return false;
    }
    // <><> 2nd <><> task >>->  to send the dice value to the backend and then send it
    //                back to everyone's frontend
    socket.emit("diceValue", this.diceValue, myRoomNo);
    this.checkForEligilePieces();
  }

  checkForEligilePieces() {
    const player = PLAYERS[this.turn];

    //eligible pieces of a given player
    const eligiblePieces = this.getEligiblePieces(player);

    if (eligiblePieces.length) {
      //highlight pieces
      UI.highlightPieces(player, eligiblePieces);
    } else {
      this.increamentTurn();
    }
  }

  increamentTurn() {
    this.turn = this.turn === 0 ? 1 : 0;
    this.state = STATE.DICE_NOT_ROLLED;
    let turn = this.turn;

    // <><> 3rd <><> >==> To set turn of player
    //                    By default Player 1 will be allowed to roll first
    socket.emit("turn", turn, myRoomNo);
  }

  getEligiblePieces(player) {
    return [0, 1, 2, 3, 4, 5, 6].filter((piece) => {
      const currentPosition = this.currentPositions[player][piece];
      let b, c;

      //for PLAYER 2
      let _p2 = [b, c];
      _p2 = [HOME_ENTRANCE[player][0], HOME_ENTRANCE[player][1]];

      //for player 1
      if (player == "P1") {
        if (
          HOME_ENTRANCE[player].includes(currentPosition) &&
          this.diceValue > HOME_POSITIONS[player] - (currentPosition + 6)
        ) {
          return false;
        }
      }
      //
      if (
        this.currentPositions[player][piece] == WIN_POSITIONS[player][piece]
      ) {
        return false;
      }
      //
      else if (player == "P2") {
        if (
          player == "P2" &&
          _p2.includes(currentPosition) &&
          this.diceValue > HOME_POSITIONS[player] - (currentPosition + 7)
        ) {
          return false;
        } else if (
          HOME_ENTRANCE[player].includes(currentPosition) &&
          this.diceValue > HOME_POSITIONS[player] - (currentPosition + 5)
        ) {
          return false;
        }
      }
      if (this.isNextPositionTaken(player, piece)) {
        return false;
      }

      return true;
    });
  }

  isNextPositionTaken(player, piece) {
    // this function will either return true => when position is taken
    // or false => when position is not taken

    let occupiedIdx =
      TRACK[player].indexOf(this.currentPositions[player][piece]) +
      this.diceValue;
    let occupiedPosition = TRACK[player][occupiedIdx];

    // to check if some player is at safe position

    if (occupiedPosition == 7) {
      if (
        this.currentPositions["P1"].includes(7) ||
        this.currentPositions["P2"].includes(7)
      ) {
        return true;
      }
    }

    // to not overlap the pieces of same player

    if (this.currentPositions[player].includes(occupiedPosition)) {
      return true;
    } else {
      return false;
    }
  }

  listenResetClick() {
    UI.listenResetClick(this.resetGame.bind(this));
  }

  resetGame() {
    socket.emit("resetClicked", myRoomNo);

    // now here if we assign base positions to our current position it's going to be copied as reference and then if we update
    // the currentPositions the changes will also be reflected in our BASE_POSITIONS constant as well and we don't want that
    this.currentPositions = structuredClone(BASE_POSITIONS);
    PLAYERS.forEach((player) => {
      [0, 1, 2, 3, 4, 5, 6].forEach((piece) => {
        this.setPiecePosition(
          player,
          piece,
          this.currentPositions[player][piece]
        );
      });
    });

    //first player P1 => will be allowed to roll first
    this.turn = 0;
    this.state = STATE.DICE_NOT_ROLLED;
    PLAYERS.forEach((player) => {
      this.score[player] = 0;
      UI.setScore(player, 0);
    });
  }
  resetIndividualGame() {
    // now here if we assign base positions to our current position it's going to be copied as reference and then if we update
    // the currentPositions the changes will also be reflected in our BASE_POSITIONS constant as well and we don't want that

    this.currentPositions = structuredClone(BASE_POSITIONS);
    PLAYERS.forEach((player) => {
      [0, 1, 2, 3, 4, 5, 6].forEach((piece) => {
        this.setPiecePosition(
          player,
          piece,
          this.currentPositions[player][piece]
        );
      });
    });

    //first player P1 => will be allowed to roll first
    this.turn = 0;
    this.state = STATE.DICE_NOT_ROLLED;
    PLAYERS.forEach((player) => {
      this.score[player] = 0;
      UI.setScore(player, 0);
    });
  }

  listenPieceClick() {
    UI.listenPieceClick(this.onPieceClick.bind(this));
  }

  setPiecePosition(player, piece, newPosition) {
    //the moment position of a piece is changed just a bit before we are
    //sending data to backend in order to send it back to other player's
    //frontend so that we change change position of that piece in everyone's frontend
    socket.emit(
      "increamentedPosition",
      {
        player,
        piece,
        newPosition,
      },
      myRoomNo
    );

    //apart from just updating the DOM, we also need to update our currentPositions object
    this.currentPositions[player][piece] = newPosition;
    UI.setPiecePosition(player, piece, newPosition);
  }

  onPieceClick(e) {
    if (!this.clickedOnce) {
      this.clickedOnce = true;
      const target = e.target;
      const player = target.getAttribute("player-id");
      const piece = target.getAttribute("piece");

      setTimeout(() => {
        this.clickedOnce = false;
      }, 250);
      if (
        !target.classList.contains("player-piece") ||
        !target.classList.contains("highlight")
      ) {
        return;
      }
      this.handlePieceClick(player, piece);
    }
  }

  handlePieceClick(player, piece) {
    let currentPosition = this.currentPositions[player][piece];

    //this if else will set 0 as starting position but not 1
    if (currentPosition === BASE_POSITIONS[player][piece]) {
      currentPosition = START_POSITIONS[player];
      this.currentPositions[player][piece] = currentPosition;
      this.movePiece(player, piece, this.diceValue - 1);
      if (this.diceValue == 1) {
        this.setPiecePosition(player, piece, START_POSITIONS[player]);
        this.increamentTurn();
      }
    } else {
      this.currentPositions[player][piece] = currentPosition;
      this.movePiece(player, piece, this.diceValue);
    }
  }

  movePiece(player, piece, moveBy) {
    if (this.moveTurn && !moveBy == 0) {
      let increamenter = setInterval(() => {
        this.increamentPiecePosition(player, piece);

        let currentPosition = this.currentPositions[player][piece];

        moveBy--;
        //check For Win
        if (currentPosition == HOME_POSITIONS[player]) {
          this.increamentScore(player, piece);
        }

        if (moveBy === 0) {
          clearInterval(increamenter);

          if (this.hasPlayerWon(player)) {
            socket.emit("winner", player, myRoomNo);
            // alert(`${player} Has won`);
            this.resetGame();
          }
          const isKill = this.checkForKill(player, piece);
          if (isKill) {
            this.state = STATE.DICE_NOT_ROLLED;
            return;
          }
          const isTurn = this.getOntherTurn(player, piece);
          if (isTurn) {
            this.state = STATE.DICE_NOT_ROLLED;
            return;
          }
          this.moveTurn = false;
          this.increamentTurn();
        }
      }, 200);
    }
  }

  checkForKill(player, piece) {
    const currentPosition = this.currentPositions[player][piece];
    const opponent = player === "P1" ? "P2" : "P1";

    let kill = false;

    [0, 1, 2, 3, 4, 5, 6].forEach((piece) => {
      const opponentPosition = this.currentPositions[opponent][piece];

      if (
        currentPosition === opponentPosition &&
        !SAFE_POSITIONS.includes(currentPosition)
      ) {
        this.setPiecePosition(opponent, piece, BASE_POSITIONS[opponent][piece]);
        kill = true;
      }
    });
    return kill;
  }

  increamentScore(player, piece) {
    this.score[player]++;
    UI.setScore(player, this.score[player]);
    this.setPiecePosition(player, piece, WIN_POSITIONS[player][piece]);
    let text = this.setLeadingPlayer();
    socket.emit("score", this.score[player], player, text, myRoomNo);
  }

  hasPlayerWon(player) {
    return [0, 1, 2, 3, 4, 5, 6].every(
      (piece) =>
        this.currentPositions[player][piece] === WIN_POSITIONS[player][piece]
    );
  }

  increamentPiecePosition(player, piece) {
    this.setPiecePosition(
      player,
      piece,
      this.getIncreamentedPosition(player, piece)
    );
  }

  getOntherTurn(player, piece) {
    let turn = false;
    if (SAFE_POSITIONS.includes(this.currentPositions[player][piece])) {
      turn = true;
    }
    return turn;
  }

  getIncreamentedPosition(player, piece) {
    //to turn the player according to their correct path

    var currentPosition = this.currentPositions[player][piece];
    if (currentPosition == 11 && player == "P2") {
      return 14;
    } else if (currentPosition === 19 && player === "P2") {
      return 4;
    } else if (currentPosition === 15 && player === "P2") {
      return 21;
    } else if (currentPosition === 13 && player === "P1") {
      return 20;
    } else {
      return currentPosition + 1;
    }
  }

  setLeadingPlayer() {
    if (this.score["P1"] > this.score["P2"]) {
      UI.setLead(`Player 1 is in the lead`);
      return `Player 1 is in the lead`;
    } else if (this.score["P1"] < this.score["P2"]) {
      UI.setLead(`Player 2 is in the lead`);
      return `Player 2 is in the lead`;
    } else if ((this.score["P1"] = this.score["P2"])) {
      UI.setLead(`Let's See Who Got The NERVE`);
      return `Let's See Who Got The NERVE`;
    }
  }
}

//* Code for sockets starts from here

let _Game;
let started = false;
let diceValue;
let frontEndPositions = {
  P1: [],
  P2: [],
};
let myRoomNo;
let frontendPlayers = PLAYERS;
document.addEventListener("keyup", () => {
  if (started === false) {
    _Game = new Game();
    _Game.turn = 1;
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

    // writing the socket statements inside the eventlistener fixes an initial bug
    socket.on("setTurn", (turn, PLAYERS) => {
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

    socket.on("setScore", (Score, player, text) => {
      _Game.score[player] = Score;
      UI.setScore(player, Score);
      UI.setLead(text);
    });

    socket.on("Winner", (player) => {
      alert(`${player} Has Won`);
    });

    socket.on("resetGame", () => {
      _Game.resetIndividualGame();
    });
  }
});

socket.on("roomID", (roomNo) => {
  myRoomNo = roomNo;
  console.log(`I should be in Room no ${roomNo}`);
});
