import player from '../entity/Player';
import PlayerConfig from '../utils/PlayerConfig';
import eventsCenter from '../utils/EventsCenter';

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
    const { width } = this.scale;

    const background = this.add.image(0, -200, 'waitingBackground');
    background.setOrigin(0, 0).setScale(5.5);
    const middle = this.add.image(0, -200, 'waitingMiddle');
    middle.setOrigin(0, 0).setScale(5.5);
    const map = this.add.tilemap('WaitingScene');
    const tileset = map.addTilesetImage('WaitingTiles', 'WaitingTiles');
    this.platform = map.createLayer('WaitingScene', tileset, 0, 0);

    const waitingMusic = this.game.music.add('gfy');
    waitingMusic.play({
      volume: 0.05,
      loop: true,
    });

    // jump sound in waiting scene
    this.jumpSound = this.game.sfx.add('jumpSound');
    this.jumpSound.volume = 0.1;

    // create cursor hover sound
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    //create click sound
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

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
      this.add.text(10, 10, `Room Code: ${this.roomKey}`, {
        fontFamily: 'customFont',
        fontSize: '16px',
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
    this.startButton = this.add
      .text(590, 80, '', {
        fontFamily: 'customFont',
        fontSize: '30px',
        fill: '#000',
      })
      .setStroke('#fff', 2);

    // create waiting message (visible when player num < required player num for starting the game)
    this.waitingForPlayers = this.add
      .text(
        width / 2,
        80,
        `Waiting for ${
          this.requiredPlayers - this.roomInfo.playerNum
        } player(s)`,
        {
          fontFamily: 'customFont',
          fontSize: '0px',
          fill: '#000',
        }
      )
      .setStroke('#fff', 2)
      .setOrigin(0.5, 0.5);
    if (this.roomInfo.playerNum < this.requiredPlayers) {
      this.waitingForPlayers.setFontSize('26px');
    }

    // set collision btw player and platform
    this.platform.setCollisionBetween(1, 1280);

    // sends message to randomize when first player joins lobby
    if (this.roomInfo.playerNum === 1) {
      console.log('randomize stages!');
      this.socket.emit('randomize');
    }

    // renders start button when there are 4 or more players in lobby;
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

    this.createUI();

    // shows number of players in the lobby
    this.playerCounter = this.add
      .text(width / 2, 40, `${this.roomInfo.playerNum} player(s) in lobby`, {
        fontFamily: 'customFont',
        fontSize: '26px',
        fill: '#000',
      })
      .setStroke('#fff', 2)
      .setOrigin(0.5, 0.5);

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
        `Waiting for ${
          this.requiredPlayers - this.roomInfo.playerNum
        } player(s)`
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

    // remove oponent from the stage when the opponent left the room
    this.socket.on('playerLeft', ({ playerId }) => {
      // remove opponent from opponent list
      if (this.opponents[playerId]) {
        this.opponents[playerId].destroy(); // remove opponent's game object
        delete this.opponents[playerId]; // remove opponent's key-value pair
        this[`opponents${playerId}`].destroy(); // remove opponent's name
      }

      // remove opponet from player list
      if (this.roomInfo.players[playerId]) {
        delete this.roomInfo.players[playerId];
        this.roomInfo.playerNum -= 1;

        // show waiting message if player num becomes lower than required num for starting game
        if (this.roomInfo.playerNum < this.requiredPlayers) {
          this.waitingForPlayers.setText(
            `Waiting for ${
              this.requiredPlayers - this.roomInfo.playerNum
            } player(s)`
          );
          this.waitingForPlayers.setFontSize('26px');
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
      fontFamily: 'customFont',
      fontSize: '0px',
      fill: '#fff',
    });

    // start timer on server when click on the start button
    this.startButton.setInteractive();
    this.startButton.on('pointerover', () => {
      this.startButton.setFill('#fff');
    });
    this.startButton.on('pointerout', () => {
      this.startButton.setFill('#000');
    });
    this.startButton.on('pointerup', () => {
      this.input.enabled = false;
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
      this.cameras.main.on('camerafadeoutcomplete', () => {
        eventsCenter.emit('startTransition');
        console.log('load next stage');
      });

      this.time.addEvent({
        delay: 2000,
        callback: () => {
          const nextStageKey = roomInfo.stages[0];
          this.game.music.stopAll();
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

  createUI() {
    const backButton = this.add
      .image(this.scale.width - 20, 20, 'backButton')
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setScale(4);
    backButton.setInteractive();
    backButton.on('pointerover', () => {
      this.cursorOver.play();
    });
    backButton.on('pointerout', () => {
      this.cursorOver.stop();
    });
    backButton.on('pointerdown', () => {
      this.clickSound.play();
      backButton.setTint(0xc2c2c2);
    });
    backButton.on('pointerup', () => {
      this.game.music.stopAll();
      this.game.sfx.stopAll();
      this.input.enabled = false;
      this.sound.stopAll();
      this.socket.emit('leaveGame');

      // go back to lobby after left the room
      this.socket.on('gameLeft', () => {
        this.socket.removeAllListeners();
        this.scene.stop('WaitingScene');
        this.scene.start('LobbyScene');
      });
    });
  }
}
