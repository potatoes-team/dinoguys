class Room {
  constructor() {
    this.players = {};
    this.playerNum = 0;
    this.countdown = 10;
  }

  addNewPlayer(socketId) {
    this.players[socketId] = {}; // -> store player info of playerName, spriteKey, moveState, etc.
    this.playerNum += 1;
  }

  removePlayer(socketId) {
    delete this.players[socketId];
    this.playerNum -= 1;
  }

  runTimer(){
      if(this.countdown > 0){
          this.countdown -= 1;
      }
  }

  resetTimer(){
      this.countdown = 10;
  }
}

// store players info for each room
// gameRooms = { [roomKey]: { players: {}, playerNum: 0 } };
const gameRooms = {};
const totalRoomNum = 5;
for (let i = 1; i <= totalRoomNum; ++i) {
  gameRooms[`room${i}`] = new Room();
}

// define socket functionality on server side
module.exports = (io) => {
  io.on('connection', function (socket) {
    console.log('a new user connected:', socket.id);

    // player joins a room with room key of the button clicked in open lobby
    socket.on('joinRoom', (roomKey) => {
      socket.join(roomKey);
      console.log(socket.id, 'joined room:', roomKey);

      // update players info of the room player joined
      const roomInfo = gameRooms[roomKey];
      roomInfo.addNewPlayer(socket.id); // will add in other args e.g. playername, spritekey, moveState, etc.
      console.log('new game rooms info:', gameRooms);

      // send all players info of that room to newly joined player
      socket.emit('roomInfo', roomInfo);

      // send newly joined player info to other players in that room
      socket.to(roomKey).emit('newPlayerJoined', {
        playerId: socket.id,
        playerInfo: roomInfo[socket.id],
      });

      // update player movement when player move
      socket.on('updatePlayer', (moveState) => {
        // will also need to update moveState of the player in gameRooms object
        // console.log(socket.id, moveState);

        // send player movement to other players in that room
        socket
          .to(roomKey)
          .emit('playerMoved', { playerId: socket.id, moveState });
      });

      socket.on('startTimer', () => {
        const countdownInterval = setInterval(() => {
            if(roomInfo.countdown > 0){
                io.in(roomKey).emit('timerUpdated', roomInfo.countdown);
                roomInfo.runTimer();
            }
            else{
                io.in(roomKey).emit('loadNextStage');
                clearInterval(countdownInterval);
            }
        }, 1000)
      })
    });

    // remove player from room info when player leaves the room (refresh/close the page)
    socket.on('disconnecting', () => {
      // socket.rooms contains socket info (datatype: Set)
      // socket.rooms = {"socketId"} -> if socket hasn't joined a room
      // socket.rooms = {"socketId", "roomKey"} -> if socket has joined a room
      let room = socket.rooms.values();
      let playerId = room.next().value;
      let roomKey = room.next().value;

      // delete player info if player has joined a room
      if (roomKey) {
        const roomInfo = gameRooms[roomKey];
        roomInfo.removePlayer(playerId);

        // send disconneted player info to other players in that room
        socket.to(roomKey).emit('playerDisconnected', { playerId });
        console.log(playerId, 'left room:', roomKey);
        console.log('new game rooms info:', gameRooms);
      }
    });
  });
};
