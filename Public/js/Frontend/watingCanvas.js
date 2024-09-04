import createCanvas from "./canvas.js";
export default function showWaitingCanvas(socket) {
  let canvas;
  socket.on("waiting", function () {
    // Show the canvas with the message "Waiting for other player to join"
    canvas = createCanvas("canvas", "Waiting for other player to join");
  });
  socket.on("start game", function () {
    // Remove the canvas and start the game
    if (canvas) {
      document.body.removeChild(canvas);
      canvas = null; // Set canvas to null to avoid memory leaks
      let canvas1 = createCanvas("canvas1", "Press Any key To Start The Game");
      let started = false;
      document.addEventListener("keyup", () => {
        if (started === false && canvas1) {
          document.body.removeChild(canvas1);
          started = true;
        }
      });
    }
  });
}
