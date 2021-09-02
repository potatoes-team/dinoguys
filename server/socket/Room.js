export default class Room {
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
    if (!this.players[socketId]) {
      this.players[socketId] = {};
      this.playerNum += 1;
    }
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
