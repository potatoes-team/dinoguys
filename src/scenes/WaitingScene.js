import player from '../entity/Player';

export default class WaitingScene extends Phaser.Scene {
  constructor() {
    super('WaitingScene');
    this.opponents = {};
    this.requiredPlayers = 2;
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
  }

  create() {
    const background = this.add.image(0, -200, 'waitingBackground');
    background.setOrigin(0, 0).setScale(5.5);
    const middle = this.add.image(0, -200, 'waitingMiddle');
    middle.setOrigin(0, 0).setScale(5.5);
    const map = this.add.tilemap('WaitingScene');
    const tileset = map.addTilesetImage('WaitingTiles', 'WaitingTiles');
    this.platform = map.createLayer('WaitingScene', tileset, 0, 0);

    const music = this.sound.add('gfy');
    music.play({
      volume: 0.05,
      loop: true,
    });

    // create player
    this.player = new player(
      this,
      20,
      400,
      'dino',
      this.socket,
      this.platform
    ).setScale(2.25);
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();
        // instantiates this.startButton that is not visible to player unless playerNum >= 2

    this.startButton = this.add.text(590, 80, '', {
      fontSize: '30px',
      fill: '#fff',
    });

    this.platform.setCollisionBetween(1, 1280); // enable collision by tile index in a range
    if(this.roomInfo.playerNum < 2){
      this.waitingForPlayers = this.add.text(450, 80, `Waiting for ${this.requiredPlayers - this.roomInfo.playerNum} player(s)`, {
        fontSize: '30px',
        fill: '#fff'
      });
    }

    this.socket.on('connect', function () {
      console.log('connected to server!');
    });

    // sends message to randomize when first player joins lobby
    if (this.roomInfo.playerNum === 1) {
      this.socket.emit('randomize');
    }

    // renders start button when there are 2 or mor players in lobby;
    if (this.roomInfo.playerNum >= 2) {
      this.startButton.setText('Start');
    }
    // set collision btw player and platform
    console.log('room info:', this.roomInfo);
    // render opponents on diff x positions to make sure we do have correct numbers of opponents on the stage
    Object.keys(this.roomInfo.players).forEach((playerId) => {
      if (playerId !== this.socket.id) {
        this.opponents[playerId] = new player(
          this,
          20,
          400,
          'dino',
          this.socket,
          this.platform
        );
      }
    });

    // shows number of players in the lobby
    this.playerCounter = this.add.text(
      470,
      40,
      `${this.roomInfo.playerNum} player(s) in lobby`,
      {
        fontSize: '30px',
        fill: '#fff',
      }
    );

    // render new opponent when new player join the room
    this.socket.on('newPlayerJoined', ({ playerId, playerInfo }) => {
      // const { playerName, spriteKey, moveState } = playerInfo;
      this.roomInfo.playerNum += 1;
      this.roomInfo.players[playerId] = {};
      if (this.roomInfo.playerNum === this.requiredPlayers) {
        this.waitingForPlayers.setFontSize('0px');
        this.startButton.setText('Start');
      }
      this.playerCounter.setText(`${this.roomInfo.playerNum} player(s) in lobby`);
      this.opponents[playerId] = new player(
        this,
        20,
        400,
        'dino',
        this.socket,
        this.platform
      );
      console.log('new player joined!');
      console.log('current opponents:', this.opponents);
    });

    // remove oponent from the stage when the opponent leaves the room (i.e. disconnected from the server)
    this.socket.on('playerDisconnected', ({ playerId }) => {
      this.opponents[playerId].destroy(); // remove opponent's game object
      delete this.opponents[playerId]; // remove opponent's key-value pair
      this.roomInfo.playerNum -= 1;
      if(this.roomInfo.playerNum < this.requiredPlayers){
        this.waitingForPlayers.setFontSize('30px');
        this.startButton.setText('');
      }
      delete this.roomInfo.players[playerId];
      this.playerCounter.setText(`${this.roomInfo.playerNum} player(s) in lobby`);
      console.log('one player left!');
      console.log('current opponents:', this.opponents);
    });

    // update opponent's movements
    this.socket.on('playerMoved', ({ playerId, moveState }) => {
      // console.log('moving in waiting scene')
      // console.log(this.opponents[playerId]);
      if (this.opponents[playerId]) {
        this.opponents[playerId].updateOtherPlayer(moveState);
      }
    });

    // instantiates countdown text but it is not visible to player until start button is clicked
    const countdown = this.add.text(640, 80, `10`, {
      fontSize: '0px',
    });

    this.startButton.setInteractive();
    // start timer on server when click on the start button
    this.startButton.on('pointerup', () => {
      this.socket.emit('startTimer');
      this.startButton.destroy();
    });

    this.socket.on('timerUpdated', (timeLeft) => {
      if (this.startButton) {
        this.startButton.destroy();
      }
      console.log('timer updating');
      countdown.setFontSize('30px');
      countdown.setText(`${timeLeft}`);
    });

    // receives message to load next scene when timer runs out
    this.socket.on('loadNextStage', (roomInfo) => {
      const nextStage = roomInfo.stages[0];
      this.socket.removeAllListeners();
      this.sound.stopAll();
      this.scene.stop('WaitingScene');
      this.scene.start(nextStage, {
        socket: this.socket,
        roomInfo: roomInfo,
        isMultiplayer: true,
      });
    });
  }

  update(time, delta) {
    this.player.update(this.cursors /* , this.jumpSound */);
  }

  createAnimations() {
    // player animations
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('dino', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('dino', { start: 4, end: 9 }),
      frameRate: 20,
      repeat: -1,
    });
    // this.anims.create({
    //   key: 'kick',
    //   frames: this.anims.generateFrameNumbers('dino', { start: 10, end: 12 }),
    //   frameRate: 10,
    //   repeat: -1,
    // });
    this.anims.create({
      key: 'hurt',
      frames: this.anims.generateFrameNumbers('dino', { start: 13, end: 16 }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
