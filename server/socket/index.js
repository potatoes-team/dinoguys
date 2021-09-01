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

  addNewPlayer(socketId, spriteKey, username) {
    this.players[socketId] = { spriteKey, username };
    this.playerNum += 1;
  }

  removePlayer(socketId) {
    if (this.players[socketId]) {
      delete this.players[socketId];
      this.playerNum -= 1;
    }
  }

  updatePlayerList() {
    // update player list based on winner list for next stage
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
    const firstStageNum = Math.ceil(this.playerNum * 0.75); // 16 -> 12 / 4 -> 3
    const secondStageNum = Math.ceil(firstStageNum * 0.5); // 12 -> 6 / 3 -> 2
    this.stageLimits[this.stages[0]] = firstStageNum;
    this.stageLimits[this.stages[1]] = secondStageNum;
    this.stageLimits[this.stages[2]] = 1;
  }

  updateLoadedPlayerNum() {
    this.playersLoaded += 1;
  }

  updateWinnerList(socketId) {
    // only add player as winner if they haven't been added yet
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

// code generator for custom room
const roomCodeGenerator = () => {
  let code = '';
  let chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// define socket functionality on server side
module.exports = (io) => {
  io.on('connection', function (socket) {
    console.log('a new user connected:', socket.id);
    console.log(staticRooms);

    // send back current static rooms status
    socket.on('checkStaticRooms', () => {
      socket.emit('staticRoomStatus', staticRooms);
    });

    // player could create a custom room
    socket.on('createRoom', () => {
      let code = roomCodeGenerator();
      while (Object.keys(gameRooms).includes(code)) {
        code = roomCodeGenerator();
      }
      gameRooms[code] = new Room();
      socket.emit('roomCreated', code);
    });

    // player joins a room with room key
    socket.on('joinRoom', ({ roomKey, spriteKey, username }) => {
      if (Object.keys(gameRooms).includes(roomKey)) {
        const roomInfo = gameRooms[roomKey];
        if (roomInfo.checkRoomStatus()) {
          if(roomInfo.playerNum < 16){
            socket.join(roomKey);
            console.log(socket.id, 'joined room:', roomKey);

            // update players info of the room player joined
            roomInfo.addNewPlayer(socket.id, spriteKey, username);
            console.log('new game rooms info:', gameRooms);

            // send all info of that room to player
            socket.emit('roomInfo', { roomInfo, roomKey });

            // send player info to other players in that room
            socket.to(roomKey).emit('newPlayerJoined', {
              playerId: socket.id,
              playerInfo: roomInfo.players[socket.id],
            });

            // countdown for starting game in the waiting room
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

            // send player movement to other players in that room
            socket.on('updatePlayer', (moveState) => {
              socket
                .to(roomKey)
                .emit('playerMoved', { playerId: socket.id, moveState });
            });

            // update winner list when opponents pass the stage
            socket.on('passStage', (stageKey) => {
              // only update winner list if the stage hasn't reached limit
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
            socket.on('randomize', () => {
              roomInfo.randomizeStages();
              console.log(roomInfo.stages);
            });

            // player leave the room during any scenes, or when they lost the stage, or when all stages ended
            socket.on('leaveGame', () => {
              // stop all listeners in the current room for the player
              const allEvents = [
                'startTimer',
                'stageLoaded',
                'updatePlayer',
                'passStage',
                'randomize',
                'leaveGame',
                'disconnecting',
              ];
              allEvents.forEach((evt) => socket.removeAllListeners(evt));

              // player leave the room
              socket.leave(roomKey);

              // remove player from player list of the room
              roomInfo.removePlayer(socket.id);
              console.log(socket.id, 'left room:', roomKey);
              console.log('new room info:', roomInfo);

              // reopen room when no players left in the room
              if (roomInfo.playerNum === 0) {
                roomInfo.openRoom();
                io.emit('updatedRooms', staticRooms);
              }

              // let player go back to lobby scene after leaving the room
              socket.emit('gameLeft');
            });

            // remove player from room info when player leaves the room (refresh/close the page)
            socket.on('disconnecting', () => {
              roomInfo.removePlayer(socket.id);

              // update stage limits for other players in the room
              roomInfo.countStageLimits();

              // reopen room where no players left in room
              if (roomInfo.playerNum === 0) {
                if (roomKey.length === 4) {
                  delete gameRooms[roomKey];
                }
                roomInfo.openRoom();
                io.emit('updatedRooms', staticRooms);
              }

              // if a player leaves a lobby where players are loaded into a stage, decrease the amount of players loaded
              if (roomInfo.playersLoaded > 0) {
                roomInfo.playersLoaded -= 1;
              }

              // send updated player list & stage limit to other players in that room
              socket.to(roomKey).emit('playerDisconnected', {
                playerId: socket.id,
                newStageLimits: roomInfo.stageLimits,
                winnerNum: roomInfo.winnerNum,
              });
              console.log(socket.id, 'disconnected from room:', roomKey);
              console.log('new game rooms info:', gameRooms);
            });
          } else{
            socket.emit('roomFull')
          }
        } else {
          socket.emit('roomClosed');
        }
      } else {
        socket.emit('roomDoesNotExist');
      }
    });
  });
};
