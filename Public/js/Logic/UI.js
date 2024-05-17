import {
  COORDINATES_MAP,
  VERTICAL_STEP_LENGTH,
  HORIZONTAL_STEP_LENGTH,
  PLAYERS,
  BASE_POSITIONS,
  WIN_POSITIONS,
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
    // Check if the piece is in base position
    if (newPosition === BASE_POSITIONS[player][piece]) {
      // Add a class to the piece
      pieceElement.classList.add("base-position");
    } else {
      // Remove the class if the piece is not in base position
      pieceElement.classList.remove("base-position");
    }

    // Check if newPosition is equal to BASE_POSITIONS[player][piece] or WIN_POSITIONS[player][piece]
    // Define a function to update the position of the game pieces
    function updatePiecePosition() {
      const pieceElement = playerPiecesElement[player][piece];
      if (
        newPosition === BASE_POSITIONS[player][piece]
        // newPosition === WIN_POSITIONS[player][piece]
      ) {
        // Set position to absolute
        pieceElement.style.position = "absolute";
        pieceElement.style.top = y * VERTICAL_STEP_LENGTH + "%";
        if (player === "P2") {
          // Get the screen width
          const screenWidth =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
          // Calculate the multiplier based on the screen width
          let multiplier = 1.93;
          if (screenWidth > 410) {
            const decreaseFactor = Math.floor((screenWidth - 410) / 2) * 0.004;

            multiplier -= decreaseFactor;
          }
          pieceElement.style.left =
            x * HORIZONTAL_STEP_LENGTH * multiplier + "vw";
        } else {
          pieceElement.style.left = x * HORIZONTAL_STEP_LENGTH * 0.65 + "vw";
        }
      } else {
        pieceElement.style.top = y * VERTICAL_STEP_LENGTH + "%";
        pieceElement.style.left = x * HORIZONTAL_STEP_LENGTH + "%";
      }
    }

    // Call the function initially to set the position
    updatePiecePosition();

    // Add the event listener for resize
    window.addEventListener("resize", updatePiecePosition);
  }

  static setTurn(index) {
    if (index < 0 || index > PLAYERS.length) {
      console.error("index out of bound!");
      return;
    }
    const player = PLAYERS[index];
    

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
    document.querySelector(".dice-value h1").innerText = value;
  }

  static setScore(player, score) {
    document.querySelector(
      `[player-id="${player}"].player .score span`
    ).innerText = score;
  }
}
