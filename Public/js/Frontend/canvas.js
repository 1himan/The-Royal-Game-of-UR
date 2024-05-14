export default function createCanvas(canvasName, text) {
  let canvas = document.createElement("canvas");
  canvas.id = canvasName;
  let context = canvas.getContext("2d");
  var window_height = window.innerHeight;
  var window_width = window.innerWidth;
  canvas.width = window_width;
  canvas.height = window_height;
  context.font = "25px Arial";
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.fillText(text, window_width / 2, window_height / 2);
  canvas.style.background = "#282828";
  document.body.insertBefore(canvas, document.body.firstChild);
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  return canvas;
}
