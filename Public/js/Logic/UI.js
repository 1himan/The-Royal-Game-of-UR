import {
  COORDINATES_MAP,
  VERTICAL_STEP_LENGTH,
  HORIZONTAL_STEP_LENGTH,
  PLAYERS,
} from "./constants.js";
const diceButtonElement = document.querySelector("#dice-btn");
const playerPiecesElement = {
  //this object have 2 properties P1 and P2 each of which will
  //contain an array(nodelist) of piece elements

  P1: document.querySelectorAll('[player-id ="P1"].player-piece'),
  P2: document.querySelectorAll('[player-id ="P2"].player-piece'),
};

export class UI {
  static listenDiceClick(callback) {
    diceButtonElement.addEventListener("click", callback);
  }

  static listenResetClick(callback) {
    document.querySelector("#reset-btn").addEventListener("click", callback);
  }

  static listenPieceClick(callback) {
    //so instead of applying event listeners to all the .piece
    // element im applying only single listener on .player-pieces
    //catch this and we can use event bubling to

    document
      .querySelector(".player-pieces")
      .addEventListener("click", callback);
  }

  /**
   * Method to set the position of a given player's
   * given piece at a given position
   * @param {string} player
   * @param {number} piece
   * @param {number} newPosition number = cell number
   */

  static setPiecePosition(player, piece, newPosition) {
    if (!playerPiecesElement[player] || !playerPiecesElement[player][piece]) {
      console.error(
        `Player element of a given player: ${player} and piece: ${piece} is not defined`
      );
      return;
    }

    const [x, y] = COORDINATES_MAP[newPosition];
    const pieceElement = playerPiecesElement[player][piece];
    pieceElement.style.top = y * VERTICAL_STEP_LENGTH + "%";
    pieceElement.style.left = x * HORIZONTAL_STEP_LENGTH + "%";
  }

  static setTurn(index) {
    if (index < 0 || index > PLAYERS.length) {
      console.error("index out of bound!");
      return;
    }
    const player = PLAYERS[index];
    //diplay the player ID
    document.querySelector(".active-player span").innerText = player;

    //The if condition in this code is checking whether the activePlayer variable
    //is truthy. In JavaScript, a variable is considered truthy if it exists and
    //is not defined as null, undefined, NaN, 0, an empty string (""), or false.
    //This line is selecting the first element in the document that matches the selector “.player.highlight”.
    //The querySelector method returns null if no matches are found.

    const activePlayer = document.querySelector(".player.highlight");
    if (activePlayer) {
      activePlayer.classList.remove("highlight");
    }
    //Highight The player
    document
      .querySelector(`[player-id="${player}"].player`)
      .classList.add("highlight");
  }

  //methods to enable and disable the dice button untill the players make any move
  static enableDice() {
    diceButtonElement.removeAttribute("disabled");
  }

  static disableDice() {
    diceButtonElement.setAttribute("disabled", "");
  }

  /**
   *
   * @param {string} player
   * @param {Number[]} pieces
   */
  static highlightPieces(player, pieces) {
    pieces.forEach((piece) => {
      const pieceElement = playerPiecesElement[player][piece];
      pieceElement.classList.add("highlight");
    });
  }

  static unhighlightPieces() {
    document.querySelectorAll(".player-piece.highlight").forEach((element) => {
      element.classList.remove("highlight");
    });
  }

  static setDiceValue(value) {
    document.querySelector(".dice-value").innerText = value;
  }

  static setScore(player, score) {
    document.querySelector(
      `[player-id="${player}"].player .score span`
    ).innerText = score;
  }

  static setLead(text) {
    let lead = document.querySelector("div.lead > h2 > span");
    lead.innerText = text;
  }
}
