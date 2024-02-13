// Setting up the Basic  Server
const express = require("express");
const app = express();
const { createServer } = require("http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
app.use(express.static(path.join(__dirname, "Public")));
server.listen(8000, () => {});

//contains the socket id of every player including app.js's socket1
let backEndPlayers = [];

let PLAYERS = {
  P1: 0,
  P2: 1,
};

app.get("/", (req, res) => {
  res.sendFile(
    "index.html"
    // , { root: path.join(__dirname, "Public") }
  );
});

io.on("connection", (socket) => {
  backEndPlayers.push(socket.id);

  PLAYERS.P1 = backEndPlayers[0];
  PLAYERS.P2 = backEndPlayers[1];

  socket.on("diceValue", (diceValue) => {
    io.emit("diceValue", diceValue);
  });

  socket.on("turn", ({ turn }) => {
    // this (Turn) will be sent to all the player's forntend and according to the
    // turn the dice btn will be disabled or enabled for a particular player
    // and our PLAYERS object is sent to everyone's frontend with their socket id
    io.emit("setTurn", { turn, PLAYERS });
  });

  //this will update the positions of selected player and piece on everyone's frontend
  //this data is comming from app.js from setPiecePosition() method
  socket.on("increamentedPosition", (data) => {
    //data is an object containing player, piece number and its position
    io.emit("updatedPositions", data);
  });

  // this piece of code gets the score from app.js in increamentScore() method
  // and then sends it to all of our player's frontend in order to display the score
  socket.on("score", (score, player, text) => {
    io.emit("setScore", score, player, text);
  });

  //display the winner on both window
  socket.on("winner", (player) => {
    io.emit("Winner", player);
  });

  //to reset the game on both player's window
  socket.on("resetClicked", () => {
    socket.broadcast.emit("resetGame");
  });

  //to disconnect players
  socket.on("disconnect", (reason) => {
    let index = backEndPlayers.indexOf(socket.id);
    if (index > -1) {
      backEndPlayers.splice(index, 1);
    }
  });
});
