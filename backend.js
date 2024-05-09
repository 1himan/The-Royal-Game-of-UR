const express = require("express");
const app = express();
const schema = require("./utils/schema.js"); // import the schema
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
//!what is a module?
//is this thing right hers is of any use?
const { rooms, socketEvents } = require("./socketHandler");

//! Conventions
// roomId - 1,2,3,4 => Made by Joining public rooms
// roomName - 656978 => Made by creating rooms

app.get("/", (req, res) => {
  res.render("lobby");
});

app.get("/game/:type", (req, res) => {
  let type = req.params.type;
  if (type === "public") {
    res.render("index", { type: "public" });
  } else if (type === "private") {
    function randomNumber() {
      let randomNumber = Math.floor(100000 + Math.random() * 900000);
      return randomNumber;
    }
    res.redirect(`/game/private/${randomNumber()}`);
  }
});

app.post("/game", (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    // If validation fails, redirect back to the lobby with an error message
    console.log("error");
    return res.render("error");
  }
  let roomName = req.body.joinRoomName;
  console.log(rooms);
  //rooms is imported from socketHandler.js
  if (roomName in rooms) {
    console.log(`Room ${roomName} exists.`);
    res.redirect(`/game/private/${roomName}`);
  } else {
    console.log(`Room ${roomName} does not exist.`);
    res.redirect("/?roomDoesNotExist=true");
  }
});

app.get("/game/private/:roomName", (req, res) => {
  let roomName = req.params.roomName;
  res.render("index.ejs", { type: "private", roomName: roomName });
});

console.log("what is this ", rooms);
//this is imported from socketHandler.js
socketEvents(io);
console.log("this is rooms", rooms);
