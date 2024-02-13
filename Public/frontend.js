import { Game } from "./Game/app.js";

//* ~~> Code for canvas
let canvas;

window.onload = () => {
  // Create the canvas element
  canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");
  var window_height = window.innerHeight;
  var window_width = window.innerWidth;
  canvas.width = window_width;
  canvas.height = window_height;
  const text = "Press Any key To Start The Game";
  context.font = "25px Arial";
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.fillText(text, window_width / 2, window_height / 2);
  canvas.style.background = "#282828";
  // Insert the canvas as the first child of the body
  document.body.insertBefore(canvas, document.body.firstChild);
  canvas.style.position = "absolute";
  canvas.style.top = "0";
};

let started = false;
document.addEventListener("keyup", () => {
  if (started === false && canvas) {
    document.body.removeChild(canvas);
    started = true;
  }
});
