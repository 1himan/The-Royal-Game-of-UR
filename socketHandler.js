let clientNo = 0;
//contains the socket id of every player that joined via public button
let public = {
  P1: 0,
  P2: 1,
};
let private = {
  // instead of these binary digits these players
  // will contain their own socket id
  P1: 0,
  P2: 1,
};

//contains the socket id of every player that joined via public button
let publicPlayer = {
  //roomId:[player1, player2]
};

//this is the object I'm trying to access but this is in socketHandler.js
//contains the socket id of every player that joined via private button
let rooms = {
  //roomId:[player1, player2]
};
module.exports.rooms = rooms;

module.exports.socketEvents = (io) =>
  io.on("connection", (socket) => {
    socket.on("join", (type) => {
      if (type === "public") {
        clientNo++;
        publicRoomNo = Math.round(clientNo / 2);
        if (!publicPlayer[publicRoomNo]) {
          //here I'm checking if room exists or not
          //if room doesn't exists -> then create a new room
          //if exists -> then don't create new one
          publicPlayer[publicRoomNo] = [];
        }
        if (publicPlayer[publicRoomNo].length < 2) {
          socket.join(publicRoomNo);
          socket.emit("roomID", publicRoomNo);
          publicPlayer[publicRoomNo].push(socket.id);
          if (publicPlayer[publicRoomNo].length === 1) {
            // Emit 'waiting' event to the first player
            io.to(socket.id).emit("waiting");
          } else if (publicPlayer[publicRoomNo].length === 2) {
            // Emit 'start game' event to all players in the room
            io.to(publicRoomNo).emit("start game");
          }
        }

        socket.on("diceValue", (diceValue, playerRoomNo) => {
          io.to(playerRoomNo).emit("diceValue", diceValue);
        });

        socket.on("turn", (turn, playerRoomNo) => {
          public.P1 = publicPlayer[playerRoomNo][0];
          public.P2 = publicPlayer[playerRoomNo][1];

          io.to(playerRoomNo).emit("setTurn", turn, public);
        });

        socket.on("increamentedPosition", (data, playerRoomNo) => {
          io.to(playerRoomNo).emit("updatedPositions", data);
        });

        socket.on("score", (score, player, playerRoomNo) => {
          io.to(playerRoomNo).emit("setScore", score, player);
        });

        socket.on("winner", (player, playerRoomNo) => {
          io.to(playerRoomNo).emit("Winner", player);
        });

        socket.on("resetClicked", () => {
          socket.broadcast.emit("resetGame");
        });

        socket.on("disconnect", (reason) => {
          --clientNo;

          for (let room in publicPlayer) {
            let index = publicPlayer[room].indexOf(socket.id);
            if (index !== -1) {
              publicPlayer[room].splice(index, 1);
            }
            // Check if there is only one player left in the room
            if (publicPlayer[room].length === 1) {
              io.to(publicPlayer[room][0]).emit(
                "opponentDisconnected",
                "You won, because the other player has left the game"
              );
            }
          }
        });
      } else if (type === "private") {
        console.log("A player just connected to a private room");
        socket.on("myRoomNo", (roomName) => {
          if (!rooms[roomName]) {
            //this line is creating a new room
            rooms[roomName] = [];
          }
          console.log("this is also rooms1", rooms);
          if (rooms[roomName].length < 2) {
            rooms[roomName].push(socket.id);
            socket.join(`${roomName}`);
            if (rooms[roomName].length === 1) {
              // Emit 'waiting' event to the first player
              io.to(socket.id).emit("waiting");
            } else if (rooms[roomName].length === 2) {
              // Emit 'start game' event to all players in the room
              io.to(roomName).emit("start game");
            }
          } else {
            socket.emit("redirect", "/");
          }
        });
        socket.on("diceValue", (diceValue, playerRoomNo) => {
          console.log(rooms[playerRoomNo]);
          io.to(playerRoomNo).emit("diceValue", diceValue);
        });
        //* set turn
        socket.on("turn", (turn, playerRoomNo) => {
          let playersInRoom = rooms[playerRoomNo];

          if (playersInRoom && playersInRoom.length >= 2) {
            private.P1 = playersInRoom[0];
            private.P2 = playersInRoom[1];
            //here the private object is emitted alongside with the turn
            //and it goes like this
            // private {
            //   P1: fkajj45kj23ku8f04564 -> this is player's unique socket Id
            //   P2: sdajj4235gyku8f0a8sd
            // }
            // and turn will either be 0 (player 1) or 1 (player 2)
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

        socket.on("disconnect", () => {
          for (let roomId in rooms) {
            if (rooms[roomId].includes(socket.id)) {
              rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
              // Check if there is only one player left in the room
              if (rooms[roomId].length === 1) {
                io.to(rooms[roomId][0]).emit(
                  "opponentDisconnected",
                  "You won, because the other player has left the game"
                );
              }

              if (rooms[roomId].length === 0) {
                delete rooms[roomId];
              }
              break;
            }
          }
        });
      }
    });
  });


  