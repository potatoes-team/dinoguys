import player from '../entity/Player';

// tilemap size & stage size
const tileSize = 16; // unit: pixel
const gameWidth = 630; // unit: num of tiles
const gameHeight = 45; // unit: num of tiles

export default class StageScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.stageKey = key;
    this.opponents = {};
    this.stageStart = false;
    this.stagePassed = false;
    this.stageEnded = false;
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.isMultiplayer = data.isMultiplayer;
    console.log('first initiation!');
    console.log('room info from init', this.roomInfo);
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.cameras.main.on('camerafadeincomplete', () => {
      console.log('stage loaded in create()');
      this.socket.emit('stageLoaded');
    });
    console.log('scene object:', this);

    // reset stage status
    this.resetStageStatus();

    // create backgrounds, map & music
    this.createParallaxBackgrounds();
    this.createMap();
    this.createMusic();

    // create player
    this.player = this.createPlayer();
    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();

    // create front map for snow stage
    if (this.stageKey === 'StageSnow') this.createMapFront();

    // set up world boundary & camera to follow player
    this.setWorldBoundaryAndCamera();

    // create flag at end point as stage goal
    this.createGoalFlag();

    // create UI
    this.createUI();

    // game mechanisms for multiplayer mode
    if (this.isMultiplayer) {
      // instantiates player countdown but not visible to players
      this.playerCountdown = this.add.text(640, 80, `5`, {
        fontSize: '0px',
      });

      // create opponents
      Object.keys(this.roomInfo.players).forEach((playerId) => {
        if (playerId !== this.socket.id) {
          this.opponents[playerId] = this.createPlayer();
        }
      });
      console.log('room info:', this.roomInfo);
      console.log('current opponents:', this.opponents);

      // update stage count down timer
      this.socket.on('stageTimerUpdated', (time) => {
        console.log(time);
        this.playerCountdown.setFontSize('30px');
        this.playerCountdown.setText(`${time}`);
      });

      // all players start the stage at the same time
      this.socket.on('startStage', () => {
        console.log('stage start');
        this.playerCountdown.destroy();
        this.stageStart = true;
      });

      // update num of players that have winned the stage
      this.socket.on('updateWinners', (winnerNum) => {
        this.stageLimitText.setText(
          `Stage Limit: ${winnerNum}/${this.stageLimit}`
        );
      });

      // update opponent's movements
      this.socket.on('playerMoved', ({ playerId, moveState }) => {
        if (this.opponents[playerId])
          this.opponents[playerId].updateOtherPlayer(moveState);
      });

      // stage ended when num of players reach the stage limit
      this.socket.on('stageEnded', (roomInfo) => {
        this.socket.removeAllListeners();
        console.log('stage ended');
        this.stageEnded = true;
        this.roomInfo = roomInfo;
        const { stageWinners, stages } = roomInfo;
        const playerWinned = stageWinners.includes(this.socket.id);
        const nextStageIdx = stages.indexOf(this.stageKey) + 1;
        const isLastStage = nextStageIdx === stages.length;

        // go to next stage or go back to lobby if not the last stage
        if (!isLastStage) {
          this.stageMessage.setText('STAGE ENDED').setFontSize(100);
          this.cameras.main.fadeOut(1000, 0, 0, 0);
          this.time.addEvent({
            delay: 5000,
            loop: false,
            repeat: 0,
            callback: () => {
              this.sound.stopAll();

              // player go to next stage if they winned the stage
              if (playerWinned) {
                console.log('go to next stage');
                this.scene.stop(this.stageKey);
                this.scene.start(stages[nextStageIdx], {
                  socket: this.socket,
                  roomInfo: this.roomInfo,
                  isMultiplayer: true,
                });
                // }
              } else {
                // player leave the socket room if lost the game
                this.socket.emit('leaveGame');

                // go back to lobby after left the room
                this.socket.on('gameLeft', () => {
                  console.log('go back to lobby');
                  this.socket.removeAllListeners();
                  this.scene.stop(this.stageKey);
                  this.scene.start('LobbyScene');
                });
              }
            },
          });

          // last stage
        } else {
          this.stageMessage.setText('WE GOT A WINNER!').setFontSize(80);
          this.cameras.main.fadeOut(1000, 0, 0, 0);
          this.time.addEvent({
            delay: 5000,
            loop: false,
            repeat: 0,
            callback: () => {
              this.sound.stopAll();
              this.socket.emit('leaveGame');
              this.socket.on('gameLeft', () => {
                console.log('go back to lobby');
                this.socket.removeAllListeners();
                this.scene.stop(this.stageKey);
                this.scene.start('LobbyScene');
              });
            },
          });
        }
      });

      // remove opponent when they leave the room (i.e. disconnected from the server)
      this.socket.on(
        'playerDisconnected',
        ({ playerId, newStageLimits, winnerNum }) => {
          if (this.opponents[playerId]) {
            this.opponents[playerId].destroy(); // remove opponent's game object
            delete this.opponents[playerId]; // remove opponent's key-value pair
            console.log('one player left the stage!');
            console.log('remained opponents:', this.opponents);
          }

          this.stageLimit = newStageLimits[this.stageKey];
          this.stageLimitText.setText(
            `Stage Limit: ${winnerNum}/${this.stageLimit}`
          );
        }
      );
    }
  }

  update() {
    if (this.isMultiplayer) {
      if (
        this.stageStart &&
        !this.stageEnded &&
        (!this.stagePassed || this.player.isMoving !== undefined)
      ) {
        this.player.update(this.cursors /* , this.jumpSound */);
      }
    } else {
      this.player.update(this.cursors /* , this.jumpSound */);
    }
  }

  resetStageStatus() {
    this.opponents = {};
    this.stageStart = false;
    this.stagePassed = false;
    this.stageEnded = false;
  }

  createMusic() {
    let musicList = [];
    for (let i = 0; i < this.musicNum; i++) {
      const music = this.sound.add(`${this.assetName}-music-${i + 1}`);
      music.once('complete', () => {
        console.log('play next song:', `${this.assetName}-music-${i + 1}`);
        const nextSong = musicList[i + 1 >= this.musicNum ? 0 : i + 1];
        nextSong.volume = 0.05;
        nextSong.play();
      });
      musicList.push(music);
    }
    this.backgroundMusic = musicList[0];
    this.backgroundMusic.volume = 0.05;
    this.backgroundMusic.play();
  }

  createParallaxBackgrounds() {
    const { height, width } = this.scale;
    const bg = this.bgSettings;
    for (let i = 0; i < bg.layerNum; ++i) {
      this.add
        .tileSprite(
          0,
          height,
          width * bg.tileWidth[i],
          bg.imgHeight,
          `${this.assetName}_bgLayer${i + 1}`
        )
        .setOrigin(0, 1)
        .setScale(bg.scale)
        .setScrollFactor(bg.scrollFactors[i]);
    }
  }

  createPlayer() {
    // toggle to create player at start/end point (for dev purpose)
    const createAtStart = false;

    // create player at start point
    if (createAtStart) {
      const { x, y } = this.startPoint;
      return new player(this, x, y, 'dino', this.socket, this.platform);
    } else {
      // create player at end point
      const { x, y } = this.endPoint;
      return new player(
        this,
        x - 50,
        y - 50,
        'dino',
        this.socket,
        this.platform
      );
    }
  }

  createGoalFlag() {
    // create flag
    this.flag = this.physics.add
      .staticSprite(this.endPoint.x, this.endPoint.y, 'flag')
      .setOrigin(0.5, 1);
    this.flag.body.reset();
    this.flag.body.setSize(this.flag.width * 0.6);

    // player win the stage when they touch the flag
    this.physics.add.overlap(this.player, this.flag, () => {
      if (!this.stageEnded) {
        this.flag.play('flag-waving', true);
        this.physics.world.disable(this.flag);
        this.stagePassed = true;
        this.stageMessage.setText('SUCCESS!').setFontSize(100);

        // let player fly after celebrating
        this.time.addEvent({
          delay: 800,
          callback: () => {
            this.player.lauchToAir();
          },
        });

        // inform other players the player pass the stage
        if (this.isMultiplayer) this.socket.emit('passStage', this.stageKey);
      }
    });
  }

  createUI() {
    // message that should appear at the middle
    this.stageMessage = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '', {
        fontSize: '0px',
        fill: '#fff',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);

    // home button for single-player mode
    if (!this.isMultiplayer) {
      const homeButton = this.add
        .text(this.scale.width - 20, 20, 'HOME', {
          fontSize: '30px',
          fill: '#fff',
        })
        .setScrollFactor(0)
        .setOrigin(1, 0);
      homeButton.setInteractive();
      homeButton.on('pointerup', () => {
        this.sound.stopAll();
        this.scene.stop(this.stageKey);
        this.scene.start('StageSelection');
      });
    } else {
      // show num of winners so far vs. the stage threshold
      this.setStageLimit();
      this.stageLimitText = this.add
        .text(this.scale.width - 20, 20, `Stage Limit: 0/${this.stageLimit}`, {
          fontSize: '30px',
          fill: '#fff',
        })
        .setScrollFactor(0)
        .setOrigin(1, 0);
    }
  }

  setStageLimit() {
    this.stageLimit = this.roomInfo.stageLimits[this.stageKey];
  }

  setWorldBoundaryAndCamera() {
    const totalWidth = tileSize * gameWidth;
    const totalHeight = tileSize * gameHeight;
    this.physics.world.setBounds(0, 0, totalWidth, totalHeight);
    this.cameras.main.setBounds(0, 0, totalWidth, totalHeight);
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
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
    this.anims.create({
      key: 'hurt',
      frames: this.anims.generateFrameNumbers('dino', { start: 13, end: 16 }),
      frameRate: 10,
      repeat: -1,
    });

    // flag animation
    this.anims.create({
      key: 'flag-waving',
      frames: this.anims.generateFrameNumbers('flag', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
