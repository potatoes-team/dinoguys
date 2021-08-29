class Room {
  constructor() {
    this.players = {};
    this.playerNum = 0;
    this.countdown = 10;
    this.stageTimer = 5;
    this.isOpen = true;
    this.stages = ['StageForest', 'StageSnow', 'StageDungeon'];
    this.playersLoaded = 0;
    this.stageThresholds = {};
    this.passedPlayerIds = [];
    this.passedPlayerNum = 0;
    this.gameStart = false;
  }

  addNewPlayer(socketId) {
    this.players[socketId] = {}; // -> store player info of playerName, spriteKey, moveState, etc.
    this.playerNum += 1;
  }

  removePlayer(socketId) {
    delete this.players[socketId];
    this.playerNum -= 1;
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
    this.countStageThresholds();
  }

  openRoom() {
    this.isOpen = true;
    this.resetTimer();
    this.resetStageTimer();
  }

  checkRoomStatus() {
    if (this.isOpen) {
      return true;
    } else {
      return false;
    }
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

  countStageThresholds() {
    const firstStageNum = Math.ceil(this.playerNum * 0.75);
    const secondStageNum = Math.ceil(firstStageNum * 0.5);
    this.stageThresholds[this.stages[0]] = firstStageNum;
    this.stageThresholds[this.stages[1]] = secondStageNum;
    this.stageThresholds[this.stages[2]] = 1;
  }

  updateStageStatus(socketId) {
    this.passedPlayerNum += 1;
    this.passedPlayerIds.push(socketId);
  }

  resetStageStatus() {
    this.passedPlayerNum = 0;
    this.passedPlayerIds = [];
  }

  startStage() {
    this.gameStart = true;
  }
}

// store players info for each room
// gameRooms = { [roomKey]: { players: {}, playerNum: 0 } };
const gameRooms = {};
const staticRooms = [];
const totalRoomNum = 5;
for (let i = 1; i <= totalRoomNum; ++i) {
  gameRooms[`room${i}`] = new Room();
  staticRooms.push(gameRooms[`room${i}`]);
}

// define socket functionality on server side
module.exports = (io) => {
  io.on('connection', function (socket) {
    console.log('a new user connected:', socket.id);
    console.log(staticRooms);

    socket.on('checkStaticRooms', () => {
      socket.emit('staticRoomStatus', staticRooms);
    });

    // player joins a room with room key of the button clicked in open lobby
    socket.on('joinRoom', (roomKey) => {
      const roomInfo = gameRooms[roomKey];
      if (roomInfo.checkRoomStatus()) {
        socket.join(roomKey);
        console.log(socket.id, 'joined room:', roomKey);

        // update players info of the room player joined
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

        // countdown for starting game
        socket.on('startTimer', () => {
          const countdownInterval = setInterval(() => {
            if (roomInfo.countdown > 0) {
              io.in(roomKey).emit('timerUpdated', roomInfo.countdown);
              roomInfo.runTimer();
            } else {
              roomInfo.closeRoom();
              console.log(`room ${roomKey} closed!`, roomInfo);
              io.emit('updatedRooms', staticRooms);
              io.in(roomKey).emit('loadNextStage', roomInfo);
              clearInterval(countdownInterval);
            }
          }, 1000);
        });

        // receive message when player loads in
        socket.on('stageLoaded', () => {
          roomInfo.playersLoaded += 1;
          console.log('is loaded', socket.id);
          console.log('number of players loaded', roomInfo.playersLoaded);
          // when all players load in start timer for
          if (roomInfo.playerNum === roomInfo.playersLoaded) {
            console.log('players all loaded');
            const stageInterval = setInterval(() => {
              if (roomInfo.stageTimer > 0) {
                console.log('stage timer updated: ', roomInfo.stageTimer);
                io.in(roomKey).emit('stageTimerUpdated', roomInfo.stageTimer);
                roomInfo.runStageTimer();
              } else {
                io.in(roomKey).emit('startStage', {
                  gameStatus: roomInfo.gameStart,
                });
                clearInterval(stageInterval);
              }
            }, 1000);
          }
        });

        // receive message when opponents pass the stage
        socket.on('passStage', (stageKey) => {
          if (!roomInfo.passedPlayerIds.includes(socket.id)) {
            if (roomInfo.passedPlayerNum < roomInfo.stageThresholds[stageKey]) {
              roomInfo.updateStageStatus(socket.id);
              io.in(roomKey).emit(
                'updatePassedPlayer',
                roomInfo.passedPlayerNum
              );
            }

            // end the stage if num of players reach the stage threshold
            if (
              roomInfo.passedPlayerNum >= roomInfo.stageThresholds[stageKey]
            ) {
              io.in(roomKey).emit('stageEnded', roomInfo.passedPlayerIds);
              roomInfo.resetStageStatus();
            }
          }
        });

        // randomizes stage order in roomInfo
        socket.on('randomize', () => {
          roomInfo.randomizeStages();
          console.log(roomInfo.stages);
        });

        // player leave the room during waiting scene / when they lost the game / when game ended
        socket.on('leaveRoom', () => {
          socket.leave(roomKey);
          roomInfo.removePlayer(socket.id);
          console.log(socket.id, 'left room:', roomKey);
          console.log('new game rooms info:', gameRooms);

          if (roomInfo.playerNum === 0) {
            roomInfo.openRoom();
            io.emit('updatedRooms', staticRooms);
          }
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
  });
};
