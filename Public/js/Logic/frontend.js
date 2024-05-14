//* Code for canvas
import createCanvas from "../Frontend/canvas.js";
// let canvas;

window.onload = () => {
  let canvas1 = createCanvas("canvas1", "Press Any key To Start The Game");
  let started = false;
  document.addEventListener("keyup", () => {
    if (started === false && canvas1) {
      document.body.removeChild(canvas1);
      started = true;
    }
  });
};
