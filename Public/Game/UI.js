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
    //This code is checking if a specific element exists in a nested object structure. Here's a breakdown:
    //
    //1. `playerPiecesElement` is an object that contains information about different players and their pieces.
    //2. `playerPiecesElement[player]` is trying to access the property of the `playerPiecesElement` object that corresponds to the `player` variable.
    //3. `playerPiecesElement[player][piece]` is trying to access the property of the `playerPiecesElement[player]` object that corresponds to the `piece` variable.
    //
    //The `if` statement checks two conditions using the logical OR (`||`) operator:
    //
    //- `!playerPiecesElement[player]`: This checks if the `player` property does not exist in the `playerPiecesElement` object.
    //- `!playerPiecesElement[player][piece]`: This checks if the `piece` property does not exist in the `playerPiecesElement[player]` object.
    //
    //If either of these conditions is true, the code inside the `if` statement block will execute. This code does two things:
    //
    //- It logs a message to the console stating that the player element of the given player and piece is not defined.
    //- It then immediately exits the current function using the `return` statement, preventing any further code in the function from running.
    //
    //In summary, this code is used to prevent errors that could occur if you try to access a property on an undefined object. It's a common practice in JavaScript
    // to ensure that an object and its properties exist before trying to use them. If they don't exist, the function returns early to avoid any potential errors.
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

