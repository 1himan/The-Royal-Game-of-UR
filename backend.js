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

//! Conventions
// roomId - 1,2,3,4 => Made by Joining public rooms
// roomName - 656978 => Made by creating rooms

//contains the socket id of every player that joined via public button
let publicPlayer = [];

let public = {
  P1: 0,
  P2: 1,
};
let private = {
  P1: 0,
  P2: 1,
};

app.get("/", (req, res) => {
  res.render("lobby");
});

let rooms = {};

app.get("/game/:type", (req, res) => {
  let type = req.params.type; // This will be 'public' or 'private'

  if (type === "public") {
    // Execute public game logic
    res.render("index", { type: "public" });
  } else if (type === "private") {
    // Execute private game logic
    function randomNumber() {
      let randomNumber = Math.floor(100000 + Math.random() * 900000);
      return randomNumber;
    }
    // number = randomNumber();
    // console.log(number);
    res.redirect(`/game/private/${randomNumber()}`);
    // res.render("index", { type: "private", roomName: randomNumber() });
  }
});

app.post("/game", (req, res) => {
  let roomName = req.body.joinRoomName; // Extract roomName from the route parameters
  res.redirect(`/game/private/${roomName}`);
});

app.get("/game/private/:roomName", (req, res) => {
  let roomName = req.params.roomName; // Extract roomName from the route parameters
  res.render("index.ejs", { type: "private", roomName: roomName }); // Pass roomName to index.ejs
});

let clientNo = 0;
io.on("connection", (socket) => {
  console.log("A client just connected");
  socket.on("join", (type) => {
    if (type === "public") {
      // Execute public game logic
      clientNo++;
      socket.join(Math.round(clientNo / 2));
      socket.emit("roomID", Math.round(clientNo / 2));
      publicPlayer.push(socket.id);

      socket.on("diceValue", (diceValue, playerRoomNo) => {
        io.to(playerRoomNo).emit("diceValue", diceValue);
      });

      socket.on("turn", (turn, playerRoomNo) => {
        let index1 = (playerRoomNo - 1) * 2;
        let index2 = index1 + 1;

        // Assign the players
        public.P1 = publicPlayer[index1];
        public.P2 = publicPlayer[index2];

        io.to(playerRoomNo).emit("setTurn", turn, public);
      });

      socket.on("increamentedPosition", (data, playerRoomNo) => {
        io.to(playerRoomNo).emit("updatedPositions", data);
      });

      socket.on("score", (score, player, text, playerRoomNo) => {
        io.to(playerRoomNo).emit("setScore", score, player, text);
      });

      socket.on("winner", (player, playerRoomNo) => {
        io.to(playerRoomNo).emit("Winner", player);
      });

      socket.on("resetClicked", () => {
        socket.broadcast.emit("resetGame");
      });

      socket.on("disconnect", (reason) => {
        --clientNo;
        let index = publicPlayer.indexOf(socket.id);
        if (index > -1) {
          publicPlayer.splice(index, 1);
        }
      });
    } else if (type === "private") {
      socket.on("myRoomNo", (roomName) => {
        // When a player joins a private room
        // If the room doesn't exist yet, create it
        //I also want to check if this room is already full
        // or not max players are 2
        //but is want to keep the spectator mode on
        if (!rooms[roomName]) {
          rooms[roomName] = [];
        }
        // Add the player to the room
        rooms[roomName].push(socket.id);
        socket.join(`${roomName}`);
      });
      socket.on("diceValue", (diceValue, playerRoomNo) => {
        console.log(diceValue, playerRoomNo);
        io.to(playerRoomNo).emit("diceValue", diceValue);
      });
      //* set turn
      socket.on("turn", (turn, playerRoomNo) => {
        // Get the players in the room
        let playersInRoom = rooms[playerRoomNo];

        // Check if there are at least two players in the room
        if (playersInRoom && playersInRoom.length >= 2) {
          // Assign the players
          private.P1 = playersInRoom[0]; // Player 1 that is currently in this room
          private.P2 = playersInRoom[1]; // Player 2 that is currently in this room

          io.to(playerRoomNo).emit("setTurn", turn, private);
        }
      });
      socket.on("increamentedPosition", (data, playerRoomNo) => {
        io.to(playerRoomNo).emit("updatedPositions", data);
      });

      socket.on("score", (score, player, text, playerRoomNo) => {
        io.to(playerRoomNo).emit("setScore", score, player, text);
      });

      socket.on("winner", (player, playerRoomNo) => {
        io.to(playerRoomNo).emit("Winner", player);
      });

      socket.on("resetClicked", () => {
        socket.broadcast.emit("resetGame");
      });

      //! Handle the case where a player leaves a room or disconnects
      socket.on("disconnect", () => {
        // Iterate over all rooms
        for (let roomId in rooms) {
          // Check if the disconnecting player is in this room
          if (rooms[roomId].includes(socket.id)) {
            // Remove the player from the room
            rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);

            // If the room is now empty, delete it
            if (rooms[roomId].length === 0) {
              delete rooms[roomId];
            }

            // Since a player can only be in one room, we can break the loop once we've found the right room
            break;
          }
        }
      });
    }
  });
});
