import player from '../entity/Player';
import PlayerConfig from '../utils/PlayerConfig';

export default class WaitingScene extends Phaser.Scene {
  constructor() {
    super('WaitingScene');
    this.stageKey = 'WaitingScene';
    this.opponents = {};
    this.requiredPlayers = 4;
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.roomKey = data.roomKey;
    this.charSpriteKey = data.charSpriteKey;
    this.username = data.username;
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

    // jump sound in waiting scene
    this.jumpSound = this.sound.add('jumpSound');
    this.jumpSound.volume = 0.1;

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

    // show room code
    if (this.roomKey.length === 4) {
      this.add.text(0, 0, `Room Code: ${this.roomKey}`, {
        fontSize: '30px',
        fill: '#fff',
      });
    }

    this.usernameText = this.add
      .text(this.player.x, this.player.y - 16, this.username, {
        fontSize: '10px',
        fill: '#fff',
      })
      .setOrigin(0.5, 1);

    // create start button (visible when player num >= required player num for starting the game)
    this.startButton = this.add.text(590, 80, '', {
      fontSize: '30px',
      fill: '#fff',
    });

    // create waiting message (visible when player num < required player num for starting the game)
    this.waitingForPlayers = this.add.text(
      450,
      80,
      `Waiting for ${this.requiredPlayers - this.roomInfo.playerNum} player(s)`,
      {
        fontSize: '0px',
        fill: '#fff',
      }
    );
    if (this.roomInfo.playerNum < this.requiredPlayers) {
      this.waitingForPlayers.setFontSize('30px');
    }

    // set collision btw player and platform
    this.platform.setCollisionBetween(1, 1280);

    // sends message to randomize when first player joins lobby
    if (this.roomInfo.playerNum === 1) {
      console.log('randomize stages!');
      this.socket.emit('randomize');
    }

    // renders start button when there are 2 or more players in lobby;
    if (this.roomInfo.playerNum >= this.requiredPlayers) {
      this.startButton.setText('Start');
    }

    // create opponents
    Object.keys(this.roomInfo.players).forEach((playerId) => {
      if (playerId !== this.socket.id) {
        const { spriteKey, username } = this.roomInfo.players[playerId];
        this.opponents[playerId] = new player(
          this,
          20,
          400,
          spriteKey,
          username,
          this.socket,
          this.platform
        );
        this[`opponents${playerId}`] = this.add
          .text(
            this.opponents[playerId].x,
            this.opponents[playerId].y - 16,
            username,
            {
              fontSize: '10px',
              fill: '#fff',
            }
          )
          .setOrigin(0.5, 1);
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

    // create new opponent when new player join the room
    this.socket.on('newPlayerJoined', ({ playerId, playerInfo }) => {
      console.log('new player joined!');

      if (!this.roomInfo.players[playerId]) {
        this.roomInfo.playerNum += 1;
        this.roomInfo.players[playerId] = playerInfo; // { username, spriteKey }
        this.opponents[playerId] = new player(
          this,
          20,
          400,
          this.roomInfo.players[playerId].spriteKey,
          this.roomInfo.players[playerId].username,
          this.socket,
          this.platform
        );
      }

      if (this.roomInfo.playerNum === this.requiredPlayers) {
        this.waitingForPlayers.setFontSize('0px');
        this.startButton.setText('Start');
      }
      this.waitingForPlayers.setText(
        `Waiting for ${this.requiredPlayers - this.roomInfo.playerNum} player(s)`
      );
      this.playerCounter.setText(
        `${this.roomInfo.playerNum} player(s) in lobby`
      );

      this[`opponents${playerId}`] = this.add
        .text(
          this.opponents[playerId].x,
          this.opponents[playerId].y - 16,
          this.roomInfo.players[playerId].username,
          {
            fontSize: '10px',
            fill: '#fff',
          }
        )
        .setOrigin(0.5, 1);

      console.log('current opponents:', this.opponents);
      console.log('new room info:', this.roomInfo);
    });

    // remove oponent from the stage when the opponent disconnect from the server
    this.socket.on('playerDisconnected', ({ playerId }) => {
      // remove opponent from opponent list
      if (this.opponents[playerId]) {
        this.opponents[playerId].destroy(); // remove opponent's game object
        delete this.opponents[playerId]; // remove opponent's key-value pair
      }

      // remove opponet from player list
      if (this.roomInfo.players[playerId]) {
        delete this.roomInfo.players[playerId];
        this.roomInfo.playerNum -= 1;

        // show waiting message if player num becomes lower than required num for starting game
        if (this.roomInfo.playerNum < this.requiredPlayers) {
          this.waitingForPlayers.setText(
            `Waiting for ${this.requiredPlayers - this.roomInfo.playerNum} player(s)`
          );
          this.waitingForPlayers.setFontSize('30px');
          this.startButton.setText('');
        }
      }

      // update display for player num in the room
      this.playerCounter.setText(
        `${this.roomInfo.playerNum} player(s) in lobby`
      );
      console.log('one player left the room!');
      console.log('current room info:', this.roomInfo);
    });

    // update opponent's movements
    this.socket.on('playerMoved', ({ playerId, moveState }) => {
      if (this.opponents[playerId]) {
        this.opponents[playerId].updateOtherPlayer(moveState);
        this[`opponents${playerId}`].setX(this.opponents[playerId].x);
        this[`opponents${playerId}`].setY(this.opponents[playerId].y - 16);
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
            roomInfo,
            charSpriteKey: this.charSpriteKey,
            username: this.username,
            isMultiplayer: true,
          });
        },
      });
    });
  }

  update() {
    this.player.update(this.cursors, this.jumpSound);
    this.displayUsername();
  }

  displayUsername() {
    this.usernameText.setX(this.player.x);
    this.usernameText.setY(this.player.y - 16);
  }
}
