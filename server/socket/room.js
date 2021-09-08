class Room {
  constructor() {
    this.players = {};
    this.playerNum = 0;
    this.countdown = 10;
    this.stageTimer = 5;
    this.isOpen = true;
    this.stages = ['StageForest', 'StageSnow', 'StageDungeon'];
    this.stageIdx = 0;
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
    this.resetAllStageStatus();
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

  removeWinner(socketId) {
    const index = this.stageWinners.indexOf(socketId);
    if (index > -1) {
      this.stageWinners.splice(index, 1);
      this.winnerNum = this.stageWinners.length;
    }
  }

  reachStageLimit(stageKey) {
    return this.winnerNum >= this.stageLimits[stageKey];
  }

  resetStageStatus() {
    this.resetStageTimer();
    this.playersLoaded = 0;
    this.stageIdx = this.stageIdx + 1 > 2 ? 0 : this.stageIdx + 1;
  }

  resetWinnerList() {
    this.winnerNum = 0;
    this.stageWinners = [];
  }

  resetAllStageStatus() {
    this.stageIdx = 0;
    this.playersLoaded = 0;
    this.stageWinners = [];
    this.winnerNum = 0;
  }
}

// store players info for each room:
// gameRooms = {
//   room1: {
//     players: {},
//     playerNum: 0,
//     ...
//   },
//   room2: {...},
//   ...
// };
const gameRooms = {};
const staticRooms = [];
const totalRoomNum = 5;
for (let i = 1; i <= totalRoomNum; ++i) {
  gameRooms[`room${i}`] = new Room();
  staticRooms.push(gameRooms[`room${i}`]);
}

module.exports = { Room, gameRooms, staticRooms };
