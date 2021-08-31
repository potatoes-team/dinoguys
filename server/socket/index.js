class Room {
  constructor() {
    this.players = {};
    this.playerNum = 0;
    this.countdown = 10;
    this.stageTimer = 5;
    this.isOpen = true;
    this.stages = ['StageForest', 'StageSnow', 'StageDungeon'];
    this.playersLoaded = 0;
    this.stageLimits = {};
    this.stageWinners = [];
    this.winnerNum = 0;
  }

  addNewPlayer(socketId) {
    this.players[socketId] = {};
    this.playerNum += 1;
  }

  removePlayer(socketId) {
    if (this.players[socketId]) {
      delete this.players[socketId];
      this.playerNum -= 1;
    }
  }

  updatePlayerList() {
    Object.keys(this.players).forEach((playerId) => {
      if (!this.stageWinners.includes(playerId)) {
        this.removePlayer(playerId);
      }
    });
  }

  runTimer() {
    if (this.countdown > 0) {
      this.countdown -= 1;
    }
  }

  resetTimer() {
    this.countdown = 10;
  }

  runStageTimer() {
    this.stageTimer -= 1;
  }

  resetStageTimer() {
    this.stageTimer = 5;
  }

  closeRoom() {
    this.isOpen = false;
    this.countStageLimits();
  }

  openRoom() {
    this.isOpen = true;
    this.resetTimer();
    this.resetStageTimer();
  }

  checkRoomStatus() {
    return this.isOpen;
  }

  randomizeStages() {
    for (let i = 0; i < 50; ++i) {
      let stage1 = Math.floor(Math.random() * 3);
      let stage2 = Math.floor(Math.random() * 3);
      let temp = this.stages[stage1];
      this.stages[stage1] = this.stages[stage2];
      this.stages[stage2] = temp;
    }
  }

  countStageLimits() {
    const firstStageNum = Math.ceil(this.playerNum * 0.75);
    const secondStageNum = Math.ceil(firstStageNum * 0.5);
    this.stageLimits[this.stages[0]] = firstStageNum;
    this.stageLimits[this.stages[1]] = secondStageNum;
    this.stageLimits[this.stages[2]] = 1;
  }

  updateLoadedPlayerNum() {
    this.playersLoaded += 1;
  }

  updateWinnerList(socketId) {
    if (!this.stageWinners.includes(socketId)) {
      this.stageWinners.push(socketId);
      this.winnerNum = this.stageWinners.length;
    }
  }

  reachStageLimit(stageKey) {
    return this.winnerNum >= this.stageLimits[stageKey];
  }

  resetStageStatus() {
    this.resetStageTimer();
    this.playersLoaded = 0;
  }

  resetWinnerList() {
    this.winnerNum = 0;
    this.stageWinners = [];
  }
}

// import Room from './Room';

// store players info for each room
const gameRooms = {};
const staticRooms = [];
const totalRoomNum = 5;
for (let i = 1; i <= totalRoomNum; ++i) {
  gameRooms[`room${i}`] = new Room();
  staticRooms.push(gameRooms[`room${i}`]);
}
// gameRooms = {
//   room1: {
//     players: {},
//     playerNum: 0,
//     ...
//   },
//   room2: {...},
//   ...
// };

// define socket functionality on server side
module.exports = (io) => {
  io.on('connection', function (socket) {
    console.log('a new user connected:', socket.id);
    console.log(staticRooms);

    socket.on('checkStaticRooms', () => {
      socket.emit('staticRoomStatus', staticRooms);
    });

    // player joins a room with room key from the button clicked in open lobby
    socket.on('joinRoom', (roomKey) => {
      const roomInfo = gameRooms[roomKey];
      if (roomInfo.checkRoomStatus()) {
        socket.join(roomKey);
        console.log(socket.id, 'joined room:', roomKey);

        // update players info of the room player joined
        roomInfo.addNewPlayer(socket.id);
        console.log('new game rooms info:', gameRooms);

        // send all players info of that room to newly joined player
        socket.emit('roomInfo', roomInfo);

        // send newly joined player info to other players in that room
        socket.to(roomKey).emit('newPlayerJoined', {
          playerId: socket.id,
          playerInfo: roomInfo[socket.id],
        });

        // send player movement to other players in that room
        socket.on('updatePlayer', (moveState) => {
          socket
            .to(roomKey)
            .emit('playerMoved', { playerId: socket.id, moveState });
        });

        // countdown for starting game in the waiting room
        socket.once('startTimer', () => {
          // const countdownInterval = setInterval(() => {
          //   if (roomInfo.countdown > 0) {
          //     io.in(roomKey).emit('timerUpdated', roomInfo.countdown);
          //     roomInfo.runTimer();
          //   } else {
          //     roomInfo.closeRoom();
          //     console.log(`room ${roomKey} closed!`, roomInfo);
          //     io.emit('updatedRooms', staticRooms);
          //     io.in(roomKey).emit('loadNextStage', roomInfo);
          //     clearInterval(countdownInterval);
          //     console.log('is this clock cleared?', countdownInterval);
          //   }
          // }, 1000);
          console.log('skip timer, load next stage directly');
          roomInfo.closeRoom();
          io.emit('updatedRooms', staticRooms);
          io.in(roomKey).emit('loadNextStage', roomInfo);
          socket.removeAllListeners('startTimer');
        });

        // keep track of how many players been loaded in the stage
        socket.on('stageLoaded', () => {
          roomInfo.updateLoadedPlayerNum();
          console.log(socket.id, 'is loaded');
          console.log('number of players loaded', roomInfo.playersLoaded);

          // start timer after all players been loaded in the stage
          if (roomInfo.playerNum === roomInfo.playersLoaded) {
            console.log('all players loaded');
            const stageInterval = setInterval(() => {
              if (roomInfo.stageTimer > 0) {
                console.log('stage timer updated: ', roomInfo.stageTimer);
                io.in(roomKey).emit('stageTimerUpdated', roomInfo.stageTimer);
                roomInfo.runStageTimer();
              } else {
                io.in(roomKey).emit('startStage');
                clearInterval(stageInterval);
              }
            }, 1000);
          }
        });

        // update winner list when opponents pass the stage
        socket.on('passStage', (stageKey) => {
          if (!roomInfo.reachStageLimit(stageKey)) {
            roomInfo.updateWinnerList(socket.id);
            io.in(roomKey).emit('updateWinners', roomInfo.winnerNum);
          }

          // end the stage if num of players reach the stage limit
          if (roomInfo.reachStageLimit(stageKey)) {
            console.log('reach stage limit:', roomInfo);
            roomInfo.resetStageStatus();
            roomInfo.updatePlayerList();
            io.in(roomKey).emit('stageEnded', roomInfo);
            roomInfo.resetWinnerList();
          }
        });

        // randomizes stage order in roomInfo
        socket.once('randomize', () => {
          roomInfo.randomizeStages();
          console.log(roomInfo.stages);
        });

        // // player leave the room during waiting scene / when they lost the game / when game ended
        socket.once('leaveGame', () => {
          socket.removeAllListeners('stageLoaded');
          socket.removeAllListeners('updatePlayer');
          socket.removeAllListeners('passStage');
          socket.removeAllListeners('leaveGame');

          console.log(socket.rooms);

          socket.leave(roomKey);
          console.log(socket.rooms);

          socket.emit('gameLeft', { socketRoom: socket.rooms.values() });
          roomInfo.removePlayer(socket.id);
          console.log(socket.id, 'left room:', roomKey);
          console.log('new room info:', roomInfo);

          if (roomInfo.playerNum === 0) {
            roomInfo.openRoom();
            io.emit('updatedRooms', staticRooms);
          }

          console.log(socket.rooms);
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
            if (roomInfo.playerNum === 0) {
              roomInfo.openRoom();
              io.emit('updatedRooms', staticRooms);
            }
            // if a player leaves a lobby where players are loaded into a stage, decrease the amount of players loaded
            if (roomInfo.playersLoaded > 0) {
              roomInfo.playersLoaded -= 1;
            }
            // send disconneted player info to other players in that room
            socket.to(roomKey).emit('playerDisconnected', { playerId });
            console.log(playerId, 'left room:', roomKey);
            console.log('new game rooms info:', gameRooms);
          }
        });
      } else {
        socket.emit('roomClosed');
      }
    });

    // // player leave the room during waiting scene / when they lost the game / when game ended
    // socket.on('leaveGame', () => {
    //   console.log(socket.rooms);
    //   let room = socket.rooms.values();
    //   let playerId = room.next().value;
    //   let roomKey = room.next().value;
    //   let roomInfo = gameRooms[roomKey];

    //   console.log(room);

    //   socket.leave(roomKey);
    //   console.log(room);

    //   room = socket.rooms.values();
    //   playerId = room.next().value;
    //   roomKey = room.next().value;

    //   socket.emit('gameLeft', { socketRoom: roomKey });
    //   roomInfo.removePlayer(playerId);
    //   console.log(playerId, 'left room:', roomKey);
    //   console.log('new room info:', roomInfo);

    //   if (roomInfo.playerNum === 0) {
    //     roomInfo.openRoom();
    //     io.emit('updatedRooms', staticRooms);
    //   }

    //   console.log(socket.rooms);
    // });
  });
};
