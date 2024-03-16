// Setting up the Basic  Server
const express = require("express");
const app = express();
const { createServer } = require("http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
app.use(express.static(path.join(__dirname, "Public")));
app.set("views", path.join(__dirname, "/views"));
server.listen(8000, () => {});
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const { v4: uuidv4 } = require("uuid");

//contains the socket id of every player
let backEndPlayers = [];

let PLAYERS = {
  P1: 0,
  P2: 1,
};

app.get("/", (req, res) => {
  res.render("index");
});

let clientNo = 0;

io.on("connection", (socket) => {
  console.log("A client just connected");
  clientNo++;
  socket.join(Math.round(clientNo / 2));
  socket.emit("roomID", Math.round(clientNo / 2));
  backEndPlayers.push(socket.id);

  socket.on("diceValue", (diceValue, playerRoomNo) => {
    io.to(playerRoomNo).emit("diceValue", diceValue);
  });

  socket.on("turn", (turn, playerRoomNo) => {
    if (playerRoomNo == 1) {
      PLAYERS.P1 = backEndPlayers[0];
      PLAYERS.P2 = backEndPlayers[1];
    }
    if (playerRoomNo == 2) {
      PLAYERS.P1 = backEndPlayers[2];
      PLAYERS.P2 = backEndPlayers[3];
    }
    if (playerRoomNo == 3) {
      PLAYERS.P1 = backEndPlayers[4];
      PLAYERS.P2 = backEndPlayers[5];
    }
    if (playerRoomNo == 4) {
      PLAYERS.P1 = backEndPlayers[6];
      PLAYERS.P2 = backEndPlayers[7];
    }
    if (playerRoomNo == 5) {
      PLAYERS.P1 = backEndPlayers[8];
      PLAYERS.P2 = backEndPlayers[9];
    }
    // this (Turn) will be sent to all the player's forntend and according to the
    // turn the dice btn will be disabled or enabled for a particular player
    // and our PLAYERS object is sent to everyone's frontend with their socket id
    io.to(playerRoomNo).emit("setTurn", turn, PLAYERS);
  });

  //this will update the positions of selected player and piece on everyone's frontend
  //this data is comming from app.js from setPiecePosition() method
  socket.on("increamentedPosition", (data, playerRoomNo) => {
    //data is an object containing player, piece number and its position
    io.to(playerRoomNo).emit("updatedPositions", data);
  });

  // this piece of code gets the score from app.js in increamentScore() method
  // and then sends it to all of our player's frontend in order to display the score
  socket.on("score", (score, player, text, playerRoomNo) => {
    io.to(playerRoomNo).emit("setScore", score, player, text);
  });

  //display the winner on both window
  socket.on("winner", (player, playerRoomNo) => {
    io.to(playerRoomNo).emit("Winner", player);
  });

  //to reset the game on both player's window
  socket.on("resetClicked", () => {
    socket.broadcast.emit("resetGame");
  });

  //to disconnect players
  socket.on("disconnect", (reason) => {
    --clientNo;
    let index = backEndPlayers.indexOf(socket.id);
    if (index > -1) {
      backEndPlayers.splice(index, 1);
    }
  });
});
