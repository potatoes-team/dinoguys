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
    this.playersPassed = 0;
    this.stagePassed = false;
    this.stageEnded = false;
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.isMultiplayer = data.isMultiplayer;
  }

  create() {
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

    // create obstacles
    for (let [obstacleKey, isOnStage] of Object.entries(this.obstacles)) {
      if (isOnStage) {
        switch (obstacleKey) {
          case 'fire':
            console.log('this stage has fire trap');
            break;

          case 'saw':
            console.log('this stage has saw trap');
            break;

          default:
            break;
        }
      }
    }

    // spikes for dungeon scene
    if (this.stageKey === 'StageDungeon') {
      this.spikes.setCollisionBetween(1, gameWidth * gameHeight);
      this.physics.add.collider(this.player, this.spikes, () => {
        // should only hurt when player lands on it?
        console.log('ouch!');
        this.player.setVelocityY(-200);
        this.player.setVelocityX(this.player.facingLeft ? 1000 : -1000);
        this.player.play('hurt', true);
      });
    }

    // set stage threshold & create flag at end point as stage goal
    this.setStageThreshold();
    this.createGoalFlag();

    // create UI
    this.createUI();

    // game mechanisms for multiplayer mode
    if (this.isMultiplayer) {
      // create opponents
      Object.keys(this.roomInfo.players).forEach((playerId) => {
        if (playerId !== this.socket.id) {
          this.opponents[playerId] = this.createPlayer();
        }
      });
      console.log('room info:', this.roomInfo);
      console.log('current opponents:', this.opponents);

      // inform server that stage is loaded
      this.socket.emit('stageLoaded');

      // update num of players that have passed the stage
      this.socket.on('updatePlayerPassed', (playersPassed) => {
        this.stageThresholdText.setText(
          `Players Passed: ${playersPassed}/${this.stageThreshold}`
        );
      });

      // stage ended when num of players passed the stage threshold
      this.socket.on('stageEnded', (playersPassed) => {
        console.log('stage ended');
        this.stageEnded = false;
        const { stages } = this.roomInfo;
        const nextStageIdx = stages.indexOf(this.stageKey) + 1;
        if (nextStageIdx < stages.length) {
          this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'STAGE ENDED!', {
              fontSize: '100px',
              fill: '#fff',
            })
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);

          this.time.addEvent({
            delay: 300,
            callback: () => {
              this.sound.stopAll();
              this.scene.stop(this.stageKey);
              this.scene.start(stages[nextStageIdx], {
                socket: this.socket,
                roomInfo: this.roomInfo,
                isMultiplayer: true,
              });
            },
          });
        } else {
          this.add
            .text(
              this.scale.width / 2,
              this.scale.height / 2,
              'WE GOT A WINNER!',
              {
                fontSize: '70px',
                fill: '#fff',
              }
            )
            .setOrigin(0.5, 0.5)
            .setScrollFactor(0);
        }
      });

      // remove opponent when they leave the room (i.e. disconnected from the server)
      this.socket.on('playerDisconnected', ({ playerId }) => {
        this.opponents[playerId].destroy(); // remove opponent's game object
        delete this.opponents[playerId]; // remove opponent's key-value pair
        console.log('one player left the stage!');
        console.log('remained opponents:', this.opponents);
      });

      // update opponent's movements
      this.socket.on('playerMoved', ({ playerId, moveState }) => {
        if (this.opponents[playerId])
          this.opponents[playerId].updateOtherPlayer(moveState);
      });
    }
  }

  update() {
    if (!this.stageEnded) {
      if (!this.stagePassed) {
        this.player.update(this.cursors /* , this.jumpSound */);
      } else if (this.player.isMoving !== undefined) {
        this.player.updateAfterPassed(this.cursors);
      }
    }
  }

  createMusic() {
    let musicList = [];
    for (let i = 0; i < this.musicNum; i++) {
      const music = this.sound.add(`${this.assetName}-music-${i + 1}`);
      music.once('complete', () => {
        console.log('WHAT THE HELLLLLLL MANNN');
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
    // create player at start point
    // const { x, y } = this.startPoint;
    // return new player(this, x, y, 'dino', this.socket, this.platform);

    // create player at end point (for dev purpose)
    const { x, y } = this.endPoint;
    return new player(this, x - 50, y - 50, 'dino', this.socket, this.platform);
  }

  createGoalFlag() {
    // create flag
    this.flag = this.physics.add
      .staticSprite(this.endPoint.x, this.endPoint.y, 'flag')
      .setOrigin(0.5, 1);
    this.flag.body.reset();
    this.flag.body.setSize(this.flag.width * 0.6);

    // player pass/win the stage when they touch the flag
    this.physics.add.overlap(this.player, this.flag, () => {
      if (!this.stageEnded) {
        this.flag.play('flag-waving', true);
        this.physics.world.disable(this.flag);
        this.stagePassed = true;
        this.add
          .text(
            gameWidth * tileSize - this.scale.width / 2,
            gameHeight * tileSize - this.scale.height / 2,
            'SUCCESS!',
            {
              fontSize: '100px',
              fill: '#fff',
            }
          )
          .setOrigin(0.5, 0.5);

        // let player fly after celebrating
        this.time.addEvent({
          delay: 800,
          callback: () => {
            this.player.lauchToAir();
          },
        });

        // inform other players the player pass the stage
        if (this.isMultiplayer) {
          this.socket.emit('passStage', this.stageKey);
        }
      }
    });
  }

  createUI() {
    if (!this.isMultiplayer) {
      // home button for single-player mode
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
        this.scene.start(
          'StageSelection' /* , { previousStage: this.stageKey } */
        );
      });
    } else {
      // show player that has goaled and stage threshold
      this.stageThresholdText = this.add
        .text(
          this.scale.width - 20,
          20,
          `Players Passed: 0/${this.stageThreshold}`,
          {
            fontSize: '30px',
            fill: '#fff',
          }
        )
        .setScrollFactor(0)
        .setOrigin(1, 0);
    }
  }

  setStageThreshold() {
    this.stageThreshold = this.roomInfo.stageThresholds[this.stageKey];
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

    // flag animation
    this.anims.create({
      key: 'flag-waving',
      frames: this.anims.generateFrameNumbers('flag', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
