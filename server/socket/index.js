// store players info of each room
// {[roomKey]: {players: {}, playerNum: 0}};
const gameRooms = {
  room1: {
    players: {
      // right now we are only storing playerId (i.e. socket.id) of each player
      // -> [playerId]: 'moving to the moon'
      // but in future we'll store info for each player
      // -> [playerId]: { playerName, spriteKey, moveState }
    },
    playerNum: 0,
  },
  room2: {
    players: {},
    playerNum: 0,
  },
};

module.exports = (io) => {
  io.on('connection', function (socket) {
    console.log('a new user connected:', socket.id);

    // player joins a room with room key of the button clicked in open lobby
    socket.on('joinRoom', (roomKey) => {
      socket.join(roomKey);
      console.log(socket.id, 'joined room:', roomKey);

      // update players info of the room player joined
      const roomInfo = gameRooms[roomKey];
      roomInfo.playerNum += 1;
      roomInfo.players[socket.id] = 'moving to the moon'; // in future we'll store player info (e.g. { playerName, spriteKey, moveState }) instead of 'moving to the moon'
      console.log('new game rooms info:', gameRooms);

      // send all players info of that room to newly joined player
      socket.emit('roomInfo', roomInfo);

      // send room info with newly joined player info to other players in that room
      socket.to(roomKey).emit('newPlayerJoined', roomInfo);

      // update player movement when player move
      socket.on('updatePlayer', (moveState) => {
        // will also need to update moveState of the player in gameRooms object
        // console.log(socket.id, moveState);

        // send player movement to other players in that room
        socket
          .to(roomKey)
          .emit('playerMoved', { playerId: socket.id, moveState });
      });
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
        delete roomInfo.players[playerId];
        roomInfo.playerNum -= 1;
        socket.to(roomKey).emit('playerDisconnected', { roomInfo, playerId });
        console.log(playerId, 'left room:', roomKey);
        console.log('new game rooms info:', gameRooms);
      }
    });
  });
};
