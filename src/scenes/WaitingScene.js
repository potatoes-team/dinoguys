import player from '../entity/Player';
import PlayerConfig from '../utils/PlayerConfig';

export default class WaitingScene extends Phaser.Scene {
  constructor() {
    super('WaitingScene');
    this.stageKey = 'WaitingScene';
    this.opponents = {};
    this.requiredPlayers = 2;
  }


  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.roomKey = data.roomKey;
    this.charSpriteKey = data.charSpriteKey;
    this.username = data.username;
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

    // jump sound in waiting scene
    this.jumpSound = this.sound.add('jumpSound');
    this.jumpSound.volume = 0.1


    // create player
    this.player = new player(
      this,
      20,
      400,
      this.charSpriteKey,
      this.username,
      this.socket,
      this.platform
    ).setScale(2.25);
    const playerConfig = new PlayerConfig(this);
    playerConfig.createDinoAnimations(this.charSpriteKey);
    this.cursors = this.input.keyboard.createCursorKeys();

    if(this.roomKey.length === 4){
      this.add.text(0,0, `Room Code: ${this.roomKey}`,{
        fontSize: '30px',
        fill: '#fff',
      })
    }

    this.usernameText = this.add.text(this.player.x, this.player.y - 16, this.username, {
      fontSize: '10px',
      fill: '#fff',
    }).setOrigin(0.5, 1);

      // instantiates this.startButton that is not visible to player unless playerNum >= 2
    this.startButton = this.add.text(590, 80, '', {
      fontSize: '30px',
      fill: '#fff',
    });

    this.waitingForPlayers = this.add.text(450, 80, `Waiting for ${this.requiredPlayers - this.roomInfo.playerNum} player(s)`, {
      fontSize: '0px',
      fill: '#fff'
    });

    this.platform.setCollisionBetween(1, 1280); // enable collision by tile index in a range
    if(this.roomInfo.playerNum < 2){
      this.waitingForPlayers.setFontSize('30px');
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

    // render opponents who already exist in the room
    Object.keys(this.roomInfo.players).forEach((playerId) => {
      if (playerId !== this.socket.id) {
        console.log(this.roomInfo.players[playerId].spriteKey)
        this.opponents[playerId] = new player(
          this,
          20,
          400,
          this.roomInfo.players[playerId].spriteKey,
          this.roomInfo.players[playerId].username,
          this.socket,
          this.platform
        );
        this[`opponents${playerId}`] = this.add.text(this.opponents[playerId].x, this.opponents[playerId].y - 16, this.roomInfo.players[playerId].username, {
          fontSize: '10px',
          fill: '#fff',
        }).setOrigin(0.5, 1);
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
      this.roomInfo.playerNum += 1;
      this.roomInfo.players[playerId] = playerInfo;
      if (this.roomInfo.playerNum === this.requiredPlayers) {
        this.waitingForPlayers.setFontSize('0px');
        this.startButton.setText('Start');
      }
      this.playerCounter.setText(`${this.roomInfo.playerNum} player(s) in lobby`);
      this.opponents[playerId] = new player(
        this,
        20,
        400,
        this.roomInfo.players[playerId].spriteKey,
        this.roomInfo.players[playerId].username,
        this.socket,
        this.platform
      );
      this[`opponents${playerId}`] = this.add.text(this.opponents[playerId].x, this.opponents[playerId].y - 16, this.roomInfo.players[playerId].username, {
        fontSize: '10px',
        fill: '#fff',
      }).setOrigin(0.5, 1);
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
    });

    // update opponent's movements
    this.socket.on('playerMoved', ({ playerId, moveState }) => {
      if (this.opponents[playerId]) {
        this.opponents[playerId].updateOtherPlayer(moveState);
        this[`opponents${playerId}`].setX(this.opponents[playerId].x)
        this[`opponents${playerId}`].setY(this.opponents[playerId].y - 16)
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
        charSpriteKey: this.charSpriteKey,
        username: this.username
      });
    });
  }

  update(time, delta) {
    this.player.update(this.cursors, this.jumpSound);
    this.displayUsername()
    
  }

  displayUsername() {
    this.usernameText.setX(this.player.x)
    this.usernameText.setY(this.player.y - 16)
  }
}
