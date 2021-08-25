import player from '../entity/Player';

export default class WaitingScene extends Phaser.Scene {
  constructor(){
    super('WaitingScene');
    this.opponents = {};
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
  }

  preload(){
     // platform & traps
     this.load.tilemapTiledJSON('WaitingScene', 'assets/tilemap/WaitingScene4.json');
     this.load.image('WaitingTiles', 'assets/tilemap/dinoguystest1.png');

     // background
     this.load.image('waitingBackground', 'assets/backgrounds/waitingBackground.png');
     this.load.image('waitingMiddle', 'assets/backgrounds/waitingMiddle.png');

     // player spritesheet
     this.load.spritesheet('dino', 'assets/spriteSheets/dino-blue3.png', {
       frameWidth: 15,
       frameHeight: 18,
       spacing: 9,
     });
  }
  create(){
    const background = this.add.image(0,-200, 'waitingBackground');
    background.setOrigin(0,0).setScale(5.5);
    const middle = this.add.image(0,-200, 'waitingMiddle');
    middle.setOrigin(0,0).setScale(5.5);
    const map = this.add.tilemap('WaitingScene');
    const tileset = map.addTilesetImage('WaitingTiles', 'WaitingTiles');
    this.platform = map.createLayer(
      'WaitingScene',
      tileset,
      0,
      0
      );

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

    this.platform.setCollisionBetween(1, 1280); // enable collision by tile index in a range
    this.socket.on('connect', function () {
      console.log('connected to server!');
    });
    // set collision btw player and platform
    console.log('room info:', this.roomInfo);
    let i = 1; // render opponents on diff x positions to make sure we do have correct numbers of opponents on the stage
    Object.keys(this.roomInfo.players).forEach((playerId) => {
      if (playerId !== this.socket.id) {
        this.opponents[playerId] = new player(
          this,
          20 * i++,
          400,
          'dino',
          this.socket,
          this.platform
        );
      }
    });
    const playerCounter = this.add.text(520, 40, `Players in Lobby:${this.roomInfo.playerNum}`, {
      fontSize: '30px',
      fill: '#fff'
    })
    // render new opponent when new player join the room
    this.socket.on('newPlayerJoined', ({ playerId, playerInfo }) => {
      // const { playerName, spriteKey, moveState } = playerInfo;
      this.roomInfo.playerNum += 1;
      this.roomInfo.players[playerId] = {};
      playerCounter.setText(`Players in Lobby:${this.roomInfo.playerNum}`);
      this.opponents[playerId] = new player(
        this,
        20 * i++,
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
      playerCounter.setText(`Players in Lobby:${this.roomInfo.playerNum}`);
      console.log('one player left!');
      console.log('current opponents:', this.opponents);
    });

    // update opponent's movements
    this.socket.on('playerMoved', ({ playerId, moveState }) => {
      // console.log('moving in waiting scene')
      // console.log(this.opponents[playerId]);
      if(this.opponents[playerId]){
        this.opponents[playerId].updateOtherPlayer(moveState);
      }
    });

    const countdown = this.add.text(600, 80, `10 seconds until game starts`, {
      fontSize: '0px',
    })

    const startButton = this.add.text(620, 80, 'Start', {
      fontSize: '30px',
      fill: '#fff',
    });
    startButton.setInteractive();
    startButton.on('pointerup', () => {
      this.socket.emit('startTimer');
      startButton.destroy();
    })

    this.socket.on('timerUpdated', (timeLeft) => {
      if(startButton){
        startButton.destroy();
      }
      console.log('timer updating');
      countdown.setFontSize('10px');
      countdown.setText(`${timeLeft} seconds until game starts`);
    });

    this.socket.on('loadNextStage', () => {
      this.socket.removeAllListeners('playerMoved');
      this.scene.stop('WaitingScene');
      this.scene.start('FgScene', { socket: this.socket, roomInfo: this.roomInfo });
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
