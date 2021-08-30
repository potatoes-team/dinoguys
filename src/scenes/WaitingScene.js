import player from '../entity/Player';
import PlayerConfig from '../utils/PlayerConfig';

export default class WaitingScene extends Phaser.Scene {
  constructor() {
    super('WaitingScene');
    this.opponents = {};
  }


  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.charSpriteKey = data.charSpriteKey;
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
      this.charSpriteKey,
      this.socket,
      this.platform
    ).setScale(2.25);
    const playerConfig = new PlayerConfig(this);
    playerConfig.createDinoAnimations(this.charSpriteKey);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.platform.setCollisionBetween(1, 1280); // enable collision by tile index in a range

    // instantiates startButton that is not visible to player unless playerNum >= 2
    const startButton = this.add.text(620, 80, 'Start', {
      fontSize: '0px',
      fill: '#fff',
    });

    this.socket.on('connect', function () {
      console.log('connected to server!');
    });

    // sends message to randomize when first player joins lobby
    if (this.roomInfo.playerNum === 1) {
      this.socket.emit('randomize');
    }

    // renders start button when there are 2 or mor players in lobby;
    if (this.roomInfo.playerNum >= 2) {
      startButton.setFontSize('30px');
    }
    // set collision btw player and platform
    console.log('room info:', this.roomInfo);
    // render opponents on diff x positions to make sure we do have correct numbers of opponents on the stage
    Object.keys(this.roomInfo.players).forEach((playerId) => {
      if (playerId !== this.socket.id) {
        console.log(this.roomInfo.players[playerId].spriteKey)
        this.opponents[playerId] = new player(
          this,
          20,
          400,
          this.roomInfo.players[playerId].spriteKey,
          this.socket,
          this.platform
        );
        console.log('this is opponent object', this.opponents[playerId])
      }
    });

    // shows number of players in the lobby
    const playerCounter = this.add.text(
      520,
      40,
      `Players in Lobby:${this.roomInfo.playerNum}`,
      {
        fontSize: '30px',
        fill: '#fff',
      }
    );

    // render new opponent when new player join the room
    this.socket.on('newPlayerJoined', ({ playerId, playerInfo }) => {
      // const { playerName, spriteKey, moveState } = playerInfo;
      console.log(playerInfo)
      this.roomInfo.playerNum += 1;
      this.roomInfo.players[playerId] = playerInfo;
      if (this.roomInfo.playerNum >= 2) {
        startButton.setFontSize('30px');
      }
      playerCounter.setText(`Players in Lobby:${this.roomInfo.playerNum}`);
      this.opponents[playerId] = new player(
        this,
        20,
        400,
        this.roomInfo.players[playerId].spriteKey,
        this.socket,
        this.platform
      );
      console.log(this.opponents[playerId])
      console.log('new player joined!');
      console.log('current opponents:', this.opponents);
    });

    // remove oponent from the stage when the opponent leaves the room (i.e. disconnected from the server)
    this.socket.on('playerDisconnected', ({ playerId }) => {
      this.opponents[playerId].destroy(); // remove opponent's game object
      delete this.opponents[playerId]; // remove opponent's key-value pair
      this.roomInfo.playerNum -= 1;
      delete this.roomInfo.players[playerId];
      playerCounter.setText(`Players in Lobby:${this.roomInfo.playerNum}`);
      console.log('one player left!');
      console.log('current opponents:', this.opponents);
    });

    // update opponent's movements
    this.socket.on('playerMoved', ({ playerId, moveState }) => {
      if (this.opponents[playerId]) {
        this.opponents[playerId].updateOtherPlayer(moveState);
      }
    });

    // instantiates countdown text but it is not visible to player until start button is clicked
    const countdown = this.add.text(600, 80, `10 seconds until game starts`, {
      fontSize: '0px',
    });

    startButton.setInteractive();
    // start timer on server when click on the start button
    startButton.on('pointerup', () => {
      this.socket.emit('startTimer');
      startButton.destroy();
    });

    this.socket.on('timerUpdated', (timeLeft) => {
      if (startButton) {
        startButton.destroy();
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
}
