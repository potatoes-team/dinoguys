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
    this.gameLoaded = false;
    this.hurt = false;
  }

  init(data) {
    this.socket = data.socket;
    this.roomInfo = data.roomInfo;
    this.isMultiplayer = data.isMultiplayer;
    this.charSpriteKey = data.charSpriteKey;
    this.username = data.username;
  }

  create() {
    // create backgrounds, map & music
    this.createParallaxBackgrounds();
    this.createMap();
    this.respawnPoint = this.startPoint
    this.createMusic();

    // create player
    this.createAnimations(this.charSpriteKey);
    this.player = this.createPlayer(this.charSpriteKey, this.username);
    this.usernameText = this.add.text(this.player.x, this.player.y - 16, this.username, { 
      fontSize: '10px',
      fill: '#fff', 
    }).setOrigin(0.5, 1);
    this.cursors = this.input.keyboard.createCursorKeys();

    if (this.stageKey !== 'StageForest') {
      this.enableObstacles();
    }
    // create front map for snow stage
    if (this.stageKey === 'StageSnow') this.createMapFront();

    // set up world boundary & camera to follow player
    this.setWorldBoundaryAndCamera();

    // spikes for dungeon scene
    if (this.stageKey === 'StageDungeon' || this.stageKey === 'StageSnow') {
      this.spikes.setCollisionBetween(1, gameWidth * gameHeight);
        this.physics.add.collider(this.player, this.spikes, () => {
        this.hurt = true;
        this.player.setVelocityY(-200);
        this.player.setVelocityX(this.player.facingLeft ? 300 : -300);
        this.player.play(`hurt_${this.charSpriteKey}`, true);
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

    // create stage goal
    this.createGoal();

    //create stage checkpoints
    this.createCheckPoint();

    // create UI
    if (!this.isMultiplayer) {
      this.createUI();
    }

    //jumpsound
    this.jumpSound = this.sound.add('jumpSound');
    this.jumpSound.volume = 0.1

    // game mechanisms for multiplayer mode
    if (this.isMultiplayer) {
      // instantiates player countdown but not visible to players
      this.playerCountdown = this.add.text(640, 80, `5`, {
        fontSize: '0px',
      });

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

      // remove opponent when they leave the room (i.e. disconnected from the server)
      this.socket.on('playerDisconnected', ({ playerId }) => {
        this.opponents[playerId].destroy(); // remove opponent's game object
        delete this.opponents[playerId]; // remove opponent's key-value pair
      });

      this.socket.on('stageTimerUpdated', (time) => {
        this.playerCountdown.setFontSize('30px');
        this.playerCountdown.setText(`${time}`);
      });

      this.socket.on('startStage', (gameStatus) => {
        this.playerCountdown.destroy();
        this.roomInfo.gameStart = gameStatus;
      });

      // update opponent's movements
      this.socket.on('playerMoved', ({ playerId, moveState }) => {
        if (this.opponents[playerId])
          this.opponents[playerId].updateOtherPlayer(moveState);
        this[`opponents${playerId}`].setX(this.opponents[playerId].x);
        this[`opponents${playerId}`].setY(this.opponents[playerId].y - 16);
      });
    }
  }

  update() {
    if (!this.hurt) {
      if (this.socket) {
        if (!this.gameLoaded) {
          // inform server that stage is loaded
          this.socket.emit('stageLoaded');
          this.gameLoaded = true;
        }
        if (this.roomInfo.gameStart) {
          this.player.update(this.cursors, this.jumpSound);
        }
      } else {
        this.player.update(this.cursors, this.jumpSound);
      }
    }
    if (this.stageKey !== 'StageForest') {
      for (let i = 0; i < this.anchorPoints.length; i++) {
        this[`group${i}`].rotateAround(this.anchorPoints[i], 0.03);
      }
    }
    this.displayUsername();
      if(this.player.y >= this.scale.height) {
        this.player.setVelocity(0)
        this.player.setX(this.respawnPoint.x)
        this.player.setY(this.respawnPoint.y)
        }
      if(this.stageKey === 'StageForest') {
        if(this.player.y >= this.scale.height - 50) {
          this.player.setVelocity(0)
        this.player.setX(this.respawnPoint.x)
        this.player.setY(this.respawnPoint.y)
        }
    }
  }
  displayUsername() {
    this.usernameText.setX(this.player.x);
    this.usernameText.setY(this.player.y - 16);
  }

  createMusic() {
    let musicList = [];
    for (let i = 0; i < this.musicNum; i++) {
      const music = this.sound.add(`${this.assetName}-music-${i + 1}`);
      music.once('complete', () => {
        const nextSong = musicList[i + 1 >= this.musicNum ? 0 : i + 1];
        nextSong.volume = 0.03;
        nextSong.play();
      });
      musicList.push(music);
    }
    this.backgroundMusic = musicList[0];
    this.backgroundMusic.volume = 0.03;
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
    const { x, y } = this.startPoint;
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

  createGoal() {
    this.flag = this.physics.add
      .staticSprite(this.endPoint.x, this.endPoint.y, 'flag')
      .setOrigin(0.5, 1);
    this.flag.body.reset();
    this.flag.body.setSize(this.flag.width * 0.6);
    this.physics.add.overlap(this.player, this.flag, () => {
      this.flag.play('flag-waving', true);
      this.physics.world.disable(this.flag);
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
    });
  }

  createCheckPoint() {
    for(let i = 0; i < this.checkpoints.length; i++) {
      this[`flag${i+1}`] = this.physics.add
      .staticSprite(this[`checkpoint${i+1}`].x, this[`checkpoint${i+1}`].y, 'flag')
      .setOrigin(0.5, 1);
    this[`flag${i+1}`].body.reset();
    this[`flag${i+1}`].body.setSize(this[`flag${i+1}`].width * 0.6);
    this.physics.add.overlap(this.player, this[`flag${i+1}`], () => {
      this[`flag${i+1}`].play('flag-waving', true);
      this.physics.world.disable(this[`flag${i+1}`]);
      this.respawnPoint = { x: this[`flag${i+1}`].x, y: this[`flag${i+1}`].y -50 };
    })
    }
  }

  createUI() {
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
  }

  setWorldBoundaryAndCamera() {
    const totalWidth = tileSize * gameWidth;
    const totalHeight = tileSize * gameHeight;
    this.physics.world.setBounds(0, 0, totalWidth, totalHeight);
    this.cameras.main.setBounds(0, 0, totalWidth, totalHeight);
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
  }

  createAnimations(key) {
    // player animations
    this.anims.create({
      key: `idle_${key}`,
      frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: `run_${key}`,
      frames: this.anims.generateFrameNumbers(key, { start: 4, end: 9 }),
      frameRate: 20,
      repeat: -1,
    });
    this.anims.create({
      key: `hurt_${key}`,
      frames: this.anims.generateFrameNumbers(key, { start: 13, end: 16 }),
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
