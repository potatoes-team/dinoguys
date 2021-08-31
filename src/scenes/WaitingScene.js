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
    console.log('first initiation!');
  }

  create() {
    console.log('join the waiting room');
    console.log('room info:', this.roomInfo);

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

    // set collision btw player and platform
    this.platform.setCollisionBetween(1, 1280); // enable collision by tile index in a range
    if (this.roomInfo.playerNum < 2) {
      this.waitingForPlayers = this.add.text(
        450,
        80,
        `Waiting for ${
          this.requiredPlayers - this.roomInfo.playerNum
        } player(s)`,
        {
          fontSize: '30px',
          fill: '#fff',
        }
      );
    }

    // sends message to randomize when first player joins lobby
    if (this.roomInfo.playerNum === 1) {
      console.log('randomize stages!');
      this.socket.emit('randomize');
    }

    // renders start button when there are 2 or more players in lobby;
    if (this.roomInfo.playerNum >= 2) {
      this.startButton.setText('Start');
    }

    // create opponents
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
      // const { username, spriteKey } = playerInfo;
      console.log('new player joined!');

      if (!this.roomInfo.players[playerId]) {
        this.roomInfo.playerNum += 1;
        this.roomInfo.players[playerId] = {};
        this.opponents[playerId] = new player(
          this,
          20,
          400,
          'dino',
          this.socket,
          this.platform
        );
      }

      if (this.roomInfo.playerNum === this.requiredPlayers) {
        this.waitingForPlayers.setFontSize('0px');
        this.startButton.setText('Start');
      }
      this.playerCounter.setText(
        `${this.roomInfo.playerNum} player(s) in lobby`
      );

      console.log('current opponents:', this.opponents);
    });

    // remove oponent from the stage when the opponent disconnect from the server
    this.socket.on('playerDisconnected', ({ playerId }) => {
      if (this.opponents[playerId]) {
        this.opponents[playerId].destroy(); // remove opponent's game object
        delete this.opponents[playerId]; // remove opponent's key-value pair
      }

      if (this.roomInfo.players[playerId]) {
        delete this.roomInfo.players[playerId];
        this.roomInfo.playerNum -= 1;
      }

      if (this.roomInfo.playerNum < this.requiredPlayers) {
        this.waitingForPlayers.setFontSize('30px');
        this.startButton.setText('');
      }

      this.playerCounter.setText(
        `${this.roomInfo.playerNum} player(s) in lobby`
      );
      console.log('one player left the room!');
      console.log('current opponents:', this.opponents);
    });

    // update opponent's movements
    this.socket.on('playerMoved', ({ playerId, moveState }) => {
      if (this.opponents[playerId]) {
        this.opponents[playerId].updateOtherPlayer(moveState);
      }
    });

    // instantiates countdown text but it is not visible to player until start button is clicked
    const countdown = this.add.text(640, 80, `10`, {
      fontSize: '0px',
    });

    // start timer on server when click on the start button
    this.startButton.setInteractive();
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
      this.socket.removeAllListeners();
      this.cameras.main.fadeOut(1000, 0, 0, 0);

      console.log('load next stage');

      this.time.addEvent({
        delay: 2000,
        callback: () => {
          const nextStageKey = roomInfo.stages[0];
          this.sound.stopAll();
          this.scene.stop('WaitingScene');
          this.scene.start(nextStageKey, {
            socket: this.socket,
            roomInfo: roomInfo,
            isMultiplayer: true,
          });
          // }
        },
      });
    });
  }

  update(/* time, delta */) {
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
