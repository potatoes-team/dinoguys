import player from '../entity/Player';
import eventsCenter from '../utils/EventsCenter';

// tilemap size & stage size
const tileSize = 16; // unit: pixel
const gameWidth = 630; // unit: num of tiles
const gameHeight = 45; // unit: num of tiles

export default class StageScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.stageKey = key;
    this.opponents = {};
    this.stageLoaded = false;
    this.stageStart = false;
    this.stagePassed = false;
    this.stageEnded = false;
    this.hurt = false;
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.charSpriteKey = data.charSpriteKey;
    this.username = data.username;
    this.isMultiplayer = data.isMultiplayer;
  }

  create() {
    console.log('scene object:', this);
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // start the stage after all players loaded in the stage for multiplayer mode
    if (this.isMultiplayer) {
      this.cameras.main.on('camerafadeincomplete', () => {
        console.log('stage loaded');
        this.socket.emit('stageLoaded');
      });
    }

    // reset stage status
    this.resetStageStatus();

    // create backgrounds, map & music
    this.createParallaxBackgrounds();
    this.createMap();
    this.respawnPoint = this.startPoint;
    this.createMusic();

    // create player
    this.player = this.createPlayer(this.charSpriteKey, this.username);
    this.usernameText = this.add
      .text(this.player.x, this.player.y - 16, this.username, {
        fontSize: '10px',
        fill: '#fff',
      })
      .setOrigin(0.5, 1);
    this.cursors = this.input.keyboard.createCursorKeys();

    if (this.stageKey !== 'StageForest') {
      this.enableObstacles();
    }
    // create front map for snow stage
    if (this.stageKey === 'StageSnow') this.createMapFront();

    // set up world boundary & camera to follow player
    this.setWorldBoundaryAndCamera();

    // create spike obstacels
    if (this.stageKey === 'StageDungeon' || this.stageKey === 'StageSnow') {
      this.spikes.setCollisionBetween(1, gameWidth * gameHeight);
      this.physics.add.collider(this.player, this.spikes, () => {
        this.hurt = true;
        this.player.setVelocityY(-200);
        this.player.setVelocityX(this.player.facingLeft ? 300 : -300);
        this.player.play(`hurt_${this.charSpriteKey}`, true);
        this.hurtSound.play()
        this.time.addEvent({
          delay: 300,
          callback: () => {
            this.player.setVelocityX(0);
          },
        });
        this.time.addEvent({
          delay: 800,
          callback: () => {
            this.hurt = false;
          },
        });
      });
    }

    // create flag at end point as stage goal
    this.createGoalFlag();

    //create stage checkpoints
    this.createCheckPoint();

    //create cursor hover sound
    this.cursorOver = this.sound.add('cursor');
    this.cursorOver.volume = 0.05;

    //create click sound
    this.clickSound = this.sound.add('clickSound');
    this.clickSound.volume = 0.05;

    // create UI
    this.createUI();

    //jumpsound
    this.jumpSound = this.game.sfx.add('jumpSound');
    this.jumpSound.volume = 0.1;

    // hurtsound
    this.hurtSound = this.game.sfx.add('hurtSound');
    this.hurtSound.volume = 0.1;

    // game mechanisms for multiplayer mode
    if (this.isMultiplayer) {
      // instantiates player countdown but not visible to players
      this.playerCountdown = this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2,
          `Waiting for all players loaded...`,
          {
            fontSize: '30px',
          }
        )
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);

      // create opponents
      Object.keys(this.roomInfo.players).forEach((playerId) => {
        if (playerId !== this.socket.id) {
          this.opponents[playerId] = this.createPlayer(
            this.roomInfo.players[playerId].spriteKey,
            this.roomInfo.players[playerId].username
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
        }
      });

      // update stage count down timer
      this.socket.on('stageTimerUpdated', (time) => {
        this.playerCountdown.setFontSize('100px');
        this.playerCountdown.setText(`${time}`);
      });

      // all players start the stage at the same time
      this.socket.on('startStage', () => {
        console.log('stage start');
        this.playerCountdown.destroy();
        this.stageStart = true;
      });

      // update opponent's movements
      this.socket.on('playerMoved', ({ playerId, moveState }) => {
        if (this.opponents[playerId]) {
          this.opponents[playerId].updateOtherPlayer(moveState);
          this[`opponents${playerId}`].setX(this.opponents[playerId].x);
          this[`opponents${playerId}`].setY(this.opponents[playerId].y - 16);
        }
      });

      // update num of players that have winned the stage
      this.socket.on('updateWinners', (winnerNum) => {
        this.stageLimitText.setText(
          `Stage Limit: ${winnerNum}/${this.stageLimit}`
        );
      });

      // stage ended when num of players reach the stage limit
      this.socket.on('stageEnded', (roomInfo) => {
        this.socket.removeAllListeners();
        console.log('stage ended');
        this.stageEnded = true;
        this.roomInfo = roomInfo;
        const { stageWinners, stages } = roomInfo;
        const playerWon = stageWinners.includes(this.socket.id);
        const nextStageIdx = stages.indexOf(this.stageKey) + 1;
        const isLastStage = nextStageIdx === stages.length;

        // go to next stage or go back to lobby if not the last stage
        if (!isLastStage) {
          this.stageMessage.setText('STAGE ENDED').setFontSize(100);

          this.time.addEvent({
            delay: 2000,
            callback: () => {
              this.cameras.main.fadeOut(1000, 0, 0, 0);
              if (playerWon) {
                this.cameras.main.on('camerafadeoutcomplete', () => {
                  eventsCenter.emit('startTransition');
                  console.log('load next stage');
                });
              }
            },
          });

          this.time.addEvent({
            delay: 5000,
            loop: false,
            repeat: 0,
            callback: () => {
              this.game.music.stopAll();
              this.game.sfx.stopAll();

              // player go to next stage if they winned the stage
              if (playerWon) {
                console.log('go to next stage');
                this.scene.stop(this.stageKey);
                this.scene.start(stages[nextStageIdx], {
                  socket: this.socket,
                  charSpriteKey: this.charSpriteKey,
                  username: this.username,
                  roomInfo: this.roomInfo,
                  isMultiplayer: true,
                });

                // player leave the room if lost the game
              } else {
                this.socket.emit('leaveGame');

                // go back to lobby after left the room
                this.socket.on('gameLeft', () => {
                  this.socket.removeAllListeners();
                  this.scene.stop(this.stageKey);
                  this.scene.start('LoserScene');
                });
              }
            },
          });

          // last stage
        } else {
          this.stageMessage.setText('WE GOT A WINNER!').setFontSize(80);

          this.time.addEvent({
            delay: 2000,
            callback: () => {
              this.cameras.main.fadeOut(1000, 0, 0, 0);
            },
          });

          this.time.addEvent({
            delay: 5000,
            loop: false,
            repeat: 0,
            callback: () => {
              this.game.music.stopAll();
              this.game.sfx.stopAll();
              this.socket.emit('leaveGame');
              this.socket.on('gameLeft', () => {
                this.socket.removeAllListeners();
                this.scene.stop(this.stageKey);
                this.scene.start('WinnerScene', {
                  winner: this.roomInfo.players[stageWinners[0]],
                  playerWon,
                });
              });
            },
          });
        }
      });

      // remove opponent when they leave the room (i.e. disconnected from the server)
      this.socket.on(
        'playerLeft',
        ({ playerId, newStageLimits, winnerNum }) => {
          if (this.opponents[playerId]) {
            this.opponents[playerId].destroy(); // remove opponent's game object
            delete this.opponents[playerId]; // remove opponent's key-value pair
            console.log('one player left the stage!');
            console.log('remained opponents:', this.opponents);

            this.stageLimit = newStageLimits[this.stageKey];
            this.stageLimitText.setText(
              `Stage Limit: ${winnerNum}/${this.stageLimit}`
            );
          }
        }
      );
    }
  }

  update() {
    // hide transition scene when stage is loaded
    if (!this.stageLoaded) {
      eventsCenter.emit('stopTransition');
      this.stageLoaded = true;
    }

    // player could only move when they are not hurt by obstacles
    if (!this.hurt) {
      // multiplayer mode - player could only move when current stage is active
      if (this.isMultiplayer) {
        if (this.stageStart && !this.stagePassed && !this.stageEnded) {
          this.player.update(this.cursors, this.jumpSound);
        } else if (this.stagePassed && this.player.isFlying !== undefined) {
          this.player.fly(this.cursors);
        }

        // single-player mode: player could move freely in each stage
      } else {
        if (this.player.isFlying !== undefined) {
          this.player.fly(this.cursors);
        } else {
          this.player.update(this.cursors, this.jumpSound);
        }
      }

      // respawn player when player fall off the camera, or hit the ground in stage forest
      if (
        this.player.y >= this.scale.height + 16 ||
        (this.stageKey === 'StageForest' &&
          this.player.y >= this.scale.height - 50)
      ) {
        this.player.respawn();
      }
    }

    // rotate spikedballs
    if (this.stageKey !== 'StageForest') {
      for (let i = 0; i < this.anchorPoints.length; i++) {
        this[`group${i}`].rotateAround(this.anchorPoints[i], 0.03);
      }
    }

    // update player username position based on player position
    this.displayUsername();
  }

  displayUsername() {
    this.usernameText.setX(this.player.x);
    this.usernameText.setY(this.player.y - 16);
  }

  resetStageStatus() {
    this.opponents = {};
    this.stageLoaded = false;
    this.stageStart = false;
    this.stagePassed = false;
    this.stageEnded = false;
    this.hurt = false;
  }

  createMusic() {
    let musicList = [];
    for (let i = 0; i < this.musicNum; i++) {
      const music = this.game.music.add(`${this.assetName}-music-${i + 1}`);
      music.once('complete', () => {
        console.log('play next song:', `${this.assetName}-music-${i + 1}`);
        const nextSong = musicList[i + 1 >= this.musicNum ? 0 : i + 1];
        nextSong.volume = 0.01;
        nextSong.play();
      });
      musicList.push(music);
    }
    this.backgroundMusic = musicList[0];
    this.backgroundMusic.volume = 0.01;
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

  createPlayer(spriteKey, username) {
    // create player at start point (production mode) or end point (dev mode)
    const isDevMode = false;
    const x = isDevMode ? this.endPoint.x - 50 : this.startPoint.x;
    const y = isDevMode ? this.endPoint.y - 50 : this.startPoint.y;

    return new player(
      this,
      x,
      y,
      spriteKey,
      username,
      this.socket,
      this.platform
    );
  }

  createGoalFlag() {
    // create flag
    this.flag = this.physics.add
      .staticSprite(this.endPoint.x, this.endPoint.y, 'stageflag')
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
          delay: 500,
          callback: () => {
            this.player.launchToAir();
          },
        });

        // inform other players the player pass the stage
        if (this.isMultiplayer) this.socket.emit('passStage', this.stageKey);
      }
    });
  }

  createCheckPoint() {
    for (let i = 0; i < this.checkpoints.length; i++) {
      this[`flag${i + 1}`] = this.physics.add
        .staticSprite(
          this[`checkpoint${i + 1}`].x,
          this[`checkpoint${i + 1}`].y,
          'stageflag'
        )
        .setOrigin(0.5, 1);
      this[`flag${i + 1}`].body.reset();
      this[`flag${i + 1}`].body.setSize(this[`flag${i + 1}`].width * 0.6);
      this.physics.add.overlap(this.player, this[`flag${i + 1}`], () => {
        this[`flag${i + 1}`].play('flag-waving', true);
        this.physics.world.disable(this[`flag${i + 1}`]);
        this.respawnPoint = {
          x: this[`flag${i + 1}`].x,
          y: this[`flag${i + 1}`].y - 50,
        };
      });
    }
  }

  createUI() {
    // message that should appear at the middle
    this.stageMessage = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '', {
        fontFamily: 'customFont',
        fontSize: '0px',
        fill: '#fff',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);

    // home button for single-player mode
    if (!this.isMultiplayer) {
      const homeButton = this.add
        .text(this.scale.width - 20, 20, 'GO BACK', {
          fontFamily: 'customFont',
          fontSize: '15px',
          fill: '#fff',
        })
        .setScrollFactor(0)
        .setOrigin(1, 0);
      homeButton.setInteractive();
      homeButton.on('pointerover', () => {
        this.cursorOver.play();
      });
      homeButton.on('pointerout', () => {
        this.cursorOver.stop();
      });
      homeButton.on('pointerdown', () => {
        this.clickSound.play();
      })
      homeButton.on('pointerup', () => {
        this.game.music.stopAll();
        this.game.sfx.stopAll();
        this.scene.stop(this.stageKey);
        this.scene.start('StageSelection');
      });

      // show current num of winners vs. the stage limit
    } else {
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
}
